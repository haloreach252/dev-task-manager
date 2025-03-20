// src/app/api/projects/route.ts

import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { checkPermissions } from '@/lib/permissions';
import { validateCreateProject, type ProjectWithCounts } from './types';
import { createErrorResponse, createSuccessResponse } from '../shared/utils';

export async function GET() {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();

		if (!user || error) {
			return createErrorResponse(
				{
					code: 'UNAUTHORIZED',
					message: 'Unauthorized',
				},
				401
			);
		}

		// Fetch projects where the user is a member of the team
		const projects = await prisma.project.findMany({
			where: {
				team: {
					members: {
						some: { userId: user.id },
					},
				},
			},
			include: {
				team: true,
				boards: {
					include: {
						columns: {
							include: {
								tasks: true,
							},
						},
					},
				},
			},
			orderBy: {
				updatedAt: 'desc',
			},
		});

		// Map through projects to calculate totalBoards & totalTasks
		const projectsWithCounts: ProjectWithCounts[] = projects.map(
			(project) => {
				const totalBoards = project.boards.length;
				const totalTasks = project.boards.reduce((taskCount, board) => {
					return (
						taskCount +
						board.columns.reduce(
							(colCount, column) =>
								colCount + column.tasks.length,
							0
						)
					);
				}, 0);

				return {
					id: project.id,
					name: project.name,
					description: project.description,
					teamId: project.teamId,
					team: {
						name: project.team.name,
					},
					updatedAt: project.updatedAt,
					totalBoards,
					totalTasks,
				};
			}
		);

		// Filter projects based on permissions
		const filteredProjects = await Promise.all(
			projectsWithCounts.map(async (project) => {
				const hasPermission = await checkPermissions(
					user.id,
					project.teamId,
					['viewProjects']
				);
				return hasPermission ? project : null;
			})
		);

		return createSuccessResponse({
			projects: filteredProjects.filter(
				(project): project is ProjectWithCounts => project !== null
			),
		});
	} catch (error) {
		console.error('Error fetching projects:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to fetch projects',
			},
			500
		);
	}
}

export async function POST(request: Request) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();

		if (!user || error) {
			return createErrorResponse(
				{
					code: 'UNAUTHORIZED',
					message: 'Unauthorized',
				},
				401
			);
		}

		const body = await request.json();

		// Validate input
		const validationError = validateCreateProject(body);
		if (validationError) {
			return createErrorResponse(validationError);
		}

		// Check permissions
		const hasPermission = await checkPermissions(user.id, body.teamId, [
			'createProjects',
		]);
		if (!hasPermission) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message:
						'You do not have permission to create projects with that team',
				},
				403
			);
		}

		// Verify team membership
		const teamMembership = await prisma.teamMember.findFirst({
			where: {
				userId: user.id,
				teamId: body.teamId,
			},
		});

		if (!teamMembership) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'User not part of the specified team',
				},
				403
			);
		}

		// Create project
		const newProject = await prisma.project.create({
			data: {
				name: body.name,
				description: body.description,
				teamId: body.teamId,
			},
		});

		return createSuccessResponse(newProject);
	} catch (error) {
		console.error('Error creating project:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to create project',
			},
			500
		);
	}
}
