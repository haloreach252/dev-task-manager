// src/app/api/teams/route.ts

import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import {
	defaultAdminPermissions,
	defaultEditorPermissions,
	defaultViewerPermissions,
} from '@/lib/permissions';
import { validateCreateTeam, type TeamWithPermissions } from './types';
import { createErrorResponse, createSuccessResponse } from '../shared/utils';
import { rateLimit } from '@/lib/rate-limit';

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

		// Fetch teams where the user is a member and count the total members
		const teams = await prisma.team.findMany({
			where: {
				members: { some: { userId: user.id } },
			},
			include: {
				members: {
					include: {
						teamRole: true,
					},
				},
			},
			orderBy: { name: 'asc' },
		});

		// Return teams with the users permissions
		const teamsToReturn: TeamWithPermissions[] = teams.map((team) => {
			const userMember = team.members.find(
				(member) => member.userId === user.id
			);

			let permissions: string[] = [];
			if (userMember) {
				const role = userMember.teamRole;
				const rolePermissions = role?.permissions
					? JSON.parse(role.permissions)
					: {};

				if (role.name === 'Admin') {
					permissions = ['*'];
				} else {
					permissions = Object.keys(rolePermissions).filter(
						(key) => rolePermissions[key] === true
					);
				}
			}

			return {
				id: team.id,
				name: team.name,
				description: team.description,
				totalMembers: team.members.length,
				permissions,
			};
		});

		return createSuccessResponse({ teams: teamsToReturn });
	} catch (error) {
		console.error('Error fetching teams:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to fetch teams',
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

		// Rate limit team creation
		const rateLimitResult = await rateLimit(
			user.id,
			'create_team',
			5,
			3600
		); // 5 teams per hour
		if (!rateLimitResult.success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message:
						'Too many team creation attempts. Please try again later.',
				},
				429
			);
		}

		const body = await request.json();

		// Validate input
		const validationError = validateCreateTeam(body);
		if (validationError) {
			return createErrorResponse(validationError);
		}

		// Prevent duplicate team names
		const existingTeam = await prisma.team.findFirst({
			where: { name: body.name },
		});

		if (existingTeam) {
			return createErrorResponse(
				{
					code: 'DUPLICATE_TEAM',
					message: 'A team with this name already exists.',
				},
				400
			);
		}

		// Create the team and default roles in a transaction
		const team = await prisma.$transaction(async (tx) => {
			// Create the team and default roles
			const newTeam = await tx.team.create({
				data: {
					name: body.name,
					description: body.description,
					roles: {
						createMany: {
							data: [
								{
									name: 'Admin',
									permissions: JSON.stringify(
										defaultAdminPermissions
									),
									canDelete: false,
								},
								{
									name: 'Editor',
									permissions: JSON.stringify(
										defaultEditorPermissions
									),
									canDelete: false,
								},
								{
									name: 'Viewer',
									permissions: JSON.stringify(
										defaultViewerPermissions
									),
									canDelete: false,
								},
							],
						},
					},
				},
			});

			// Fetch the created default admin role
			const adminRole = await tx.teamRole.findFirst({
				where: { teamId: newTeam.id, name: 'Admin' },
			});

			if (!adminRole) {
				throw new Error('Failed to create admin role');
			}

			// Add the current user as a team member with the admin role
			await tx.teamMember.create({
				data: {
					teamId: newTeam.id,
					userId: user.id,
					teamRoleId: adminRole.id,
					customPermissions: JSON.stringify({ '*': true }),
				},
			});

			return newTeam;
		});

		return createSuccessResponse({
			id: team.id,
			name: team.name,
			totalMembers: 1,
		});
	} catch (error) {
		console.error('Error creating team:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to create team',
			},
			500
		);
	}
}
