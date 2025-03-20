// src/app/api/teams/[teamId]/projects/route.ts

import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { getUserPermissions } from '@/lib/permissions';
import {
	createErrorResponse,
	createSuccessResponse,
} from '@/app/api/shared/utils';
import { rateLimit } from '@/lib/rate-limit';
import {
	validateCreateProject,
	validateUpdateProject,
	type CreateProjectInput,
	type UpdateProjectInput,
	type ProjectsResponse,
	type CreateProjectResponse,
	type UpdateProjectResponse,
	type DeleteProjectResponse,
} from './types';

export async function GET(
	request: Request,
	props: { params: Promise<{ teamId: string }> }
) {
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

		const { teamId } = await props.params;

		// Check if user is a member of the team
		const teamMember = await prisma.teamMember.findFirst({
			where: { teamId, userId: user.id },
		});

		if (!teamMember) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'You are not a member of this team',
				},
				403
			);
		}

		// Get user's permissions
		const userPermissions = await getUserPermissions(user.id, teamId);

		if (!userPermissions['viewProjects'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'Insufficient permissions to view projects',
				},
				403
			);
		}

		const projects = await prisma.project.findMany({
			where: { teamId },
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				name: true,
				description: true,
				teamId: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return createSuccessResponse<ProjectsResponse>({ projects });
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

export async function POST(
	request: Request,
	props: { params: Promise<{ teamId: string }> }
) {
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

		// Rate limit project creation
		const rateLimitResult = await rateLimit(
			user.id,
			'create_project',
			5,
			3600
		); // 5 projects per hour
		if (!rateLimitResult.success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message:
						'Too many project creation attempts. Please try again later.',
				},
				429
			);
		}

		const { teamId } = await props.params;
		const body = await request.json();

		// Validate input
		const validationError = validateCreateProject(body);
		if (validationError) {
			return createErrorResponse(validationError);
		}

		const projectData = body as CreateProjectInput;

		// Get user's permissions
		const userPermissions = await getUserPermissions(user.id, teamId);

		if (!userPermissions['manageProjects'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'Insufficient permissions to create projects',
				},
				403
			);
		}

		// Check for duplicate project name
		const existingProject = await prisma.project.findFirst({
			where: { teamId, name: projectData.name },
		});

		if (existingProject) {
			return createErrorResponse(
				{
					code: 'DUPLICATE_ERROR',
					message: 'A project with this name already exists',
				},
				400
			);
		}

		// Create the project
		const project = await prisma.project.create({
			data: {
				...projectData,
				teamId,
			},
			select: {
				id: true,
				name: true,
				description: true,
				teamId: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return createSuccessResponse<CreateProjectResponse>({
			project,
		});
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

export async function PATCH(
	request: Request,
	props: { params: Promise<{ teamId: string }> }
) {
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

		// Rate limit project updates
		const rateLimitResult = await rateLimit(
			user.id,
			'update_project',
			10,
			3600
		); // 10 updates per hour
		if (!rateLimitResult.success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message:
						'Too many project update attempts. Please try again later.',
				},
				429
			);
		}

		const { teamId } = await props.params;
		const body = await request.json();

		// Validate input
		const validationError = validateUpdateProject(body);
		if (validationError) {
			return createErrorResponse(validationError);
		}

		const { projectId, ...updateData } = body as UpdateProjectInput & {
			projectId: string;
		};

		if (!projectId) {
			return createErrorResponse(
				{
					code: 'VALIDATION_ERROR',
					message: 'Project ID is required',
				},
				400
			);
		}

		// Get user's permissions
		const userPermissions = await getUserPermissions(user.id, teamId);

		if (!userPermissions['manageProjects'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'Insufficient permissions to update projects',
				},
				403
			);
		}

		// Check if project exists and belongs to this team
		const project = await prisma.project.findUnique({
			where: { id: projectId, teamId },
		});

		if (!project) {
			return createErrorResponse(
				{
					code: 'NOT_FOUND',
					message: 'Project not found',
				},
				404
			);
		}

		// Check for duplicate project name if name is being updated
		if (updateData.name && updateData.name !== project.name) {
			const existingProject = await prisma.project.findFirst({
				where: { teamId, name: updateData.name },
			});

			if (existingProject) {
				return createErrorResponse(
					{
						code: 'DUPLICATE_ERROR',
						message: 'A project with this name already exists',
					},
					400
				);
			}
		}

		// Update the project
		const updatedProject = await prisma.project.update({
			where: { id: projectId },
			data: updateData,
			select: {
				id: true,
				name: true,
				description: true,
				teamId: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return createSuccessResponse<UpdateProjectResponse>({
			project: updatedProject,
		});
	} catch (error) {
		console.error('Error updating project:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to update project',
			},
			500
		);
	}
}

export async function DELETE(
	request: Request,
	props: { params: Promise<{ teamId: string }> }
) {
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

		// Rate limit project deletions
		const rateLimitResult = await rateLimit(
			user.id,
			'delete_project',
			5,
			3600
		); // 5 deletions per hour
		if (!rateLimitResult.success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message:
						'Too many project deletion attempts. Please try again later.',
				},
				429
			);
		}

		const { teamId } = await props.params;
		const { projectId } = await request.json();

		if (!projectId) {
			return createErrorResponse(
				{
					code: 'VALIDATION_ERROR',
					message: 'Project ID is required',
				},
				400
			);
		}

		// Get user's permissions
		const userPermissions = await getUserPermissions(user.id, teamId);

		if (!userPermissions['manageProjects'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'Insufficient permissions to delete projects',
				},
				403
			);
		}

		// Check if project exists and belongs to this team
		const project = await prisma.project.findUnique({
			where: { id: projectId, teamId },
		});

		if (!project) {
			return createErrorResponse(
				{
					code: 'NOT_FOUND',
					message: 'Project not found',
				},
				404
			);
		}

		// Delete the project
		await prisma.project.delete({
			where: { id: projectId },
		});

		return createSuccessResponse<DeleteProjectResponse>({
			message: 'Project deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting project:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to delete project',
			},
			500
		);
	}
}
