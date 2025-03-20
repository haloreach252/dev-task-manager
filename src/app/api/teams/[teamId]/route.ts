// src/app/api/teams/[teamId]/route.ts

import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { validateUpdateTeam } from '../types';
import {
	createErrorResponse,
	createSuccessResponse,
} from '@/app/api/shared/utils';
import { rateLimit } from '@/lib/rate-limit';

const editPermissions = ['*', 'editTeam', 'editDescription'];

export async function GET(
	request: Request,
	props: { params: Promise<{ teamId: string }> }
) {
	try {
		const { teamId } = await props.params;
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

		// Check if the user is a member of the team
		const teamMember = await prisma.teamMember.findFirst({
			where: { teamId, userId: user.id },
			include: { teamRole: true },
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

		// Fetch team details
		const team = await prisma.team.findUnique({
			where: { id: teamId },
			include: {
				members: {
					include: { user: true, teamRole: true },
				},
				projects: true,
			},
		});

		if (!team) {
			return createErrorResponse(
				{
					code: 'NOT_FOUND',
					message: 'Team not found',
				},
				404
			);
		}

		// Parse permissions
		const role = teamMember.teamRole;
		const rolePermissions = role?.permissions
			? JSON.parse(role.permissions)
			: {};

		const permissions: string[] = rolePermissions
			? Object.keys(rolePermissions).filter(
					(key) => rolePermissions[key] === true
			  )
			: [];

		return createSuccessResponse({
			team: { ...team, permissions: permissions || [] },
			members: team.members,
			projects: team.projects,
		});
	} catch (error) {
		console.error('Error fetching team:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to fetch team',
			},
			500
		);
	}
}

export async function PUT(
	request: Request,
	props: { params: Promise<{ teamId: string }> }
) {
	try {
		const { teamId } = await props.params;
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

		// Rate limit team updates
		const rateLimitResult = await rateLimit(
			user.id,
			'update_team',
			10,
			3600
		); // 10 updates per hour
		if (!rateLimitResult.success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message:
						'Too many team update attempts. Please try again later.',
				},
				429
			);
		}

		const body = await request.json();

		// Validate input
		const validationError = validateUpdateTeam(body);
		if (validationError) {
			return createErrorResponse(validationError);
		}

		// Fetch user role & permissions
		const teamMember = await prisma.teamMember.findFirst({
			where: { teamId, userId: user.id },
			include: { teamRole: true },
		});

		if (!teamMember) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'Not a team member',
				},
				403
			);
		}

		// Parse permissions
		let permissions: string[] = [];

		const role = teamMember.teamRole;
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

		const canEdit = permissions.some((r) => editPermissions.includes(r));

		if (!canEdit) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'You do not have permission to edit this team',
				},
				403
			);
		}

		if (body.name) {
			// Prevent duplicate team names only if `name` is changing
			const existingTeam = await prisma.team.findFirst({
				where: { name: body.name },
			});

			if (existingTeam && existingTeam.id !== teamId) {
				return createErrorResponse(
					{
						code: 'DUPLICATE_TEAM',
						message: 'A team with this name already exists',
					},
					400
				);
			}
		}

		const updatedTeam = await prisma.team.update({
			where: { id: teamId },
			data: {
				name: body.name,
				description: body.description,
			},
		});

		return createSuccessResponse(updatedTeam);
	} catch (error) {
		console.error('Error updating team:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to update team',
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
		const { teamId } = await props.params;
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

		// Rate limit team deletions
		const rateLimitResult = await rateLimit(
			user.id,
			'delete_team',
			3,
			3600
		); // 3 deletions per hour
		if (!rateLimitResult.success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message:
						'Too many team deletion attempts. Please try again later.',
				},
				429
			);
		}

		// Check if user is an admin
		const teamMember = await prisma.teamMember.findFirst({
			where: { teamId, userId: user.id },
			include: { teamRole: true },
		});

		if (!teamMember || teamMember.teamRole.name !== 'Admin') {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'You do not have permission to delete this team',
				},
				403
			);
		}

		// Delete the team and cascade its related data
		await prisma.team.delete({
			where: { id: teamId },
		});

		return createSuccessResponse({ message: 'Team deleted successfully' });
	} catch (error) {
		console.error('Error deleting team:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to delete team',
			},
			500
		);
	}
}
