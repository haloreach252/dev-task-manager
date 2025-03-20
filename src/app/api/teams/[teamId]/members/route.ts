// src/app/api/teams/[teamId]/members/route.ts

import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { getUserPermissions } from '@/lib/permissions';
import {
	createErrorResponse,
	createSuccessResponse,
} from '@/app/api/shared/utils';
import { rateLimit } from '@/lib/rate-limit';
import {
	validateUpdateMember,
	validateDeleteMember,
	type UpdateMemberInput,
	type DeleteMemberInput,
	type MembersResponse,
	type UpdateMemberResponse,
	type DeleteMemberResponse,
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

		if (!userPermissions['viewMembers'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'Insufficient permissions to view members',
				},
				403
			);
		}

		const members = await prisma.teamMember.findMany({
			where: { teamId },
			include: { user: true, teamRole: true },
			orderBy: { createdAt: 'desc' },
		});

		return createSuccessResponse<MembersResponse>({ members });
	} catch (error) {
		console.error('Error fetching members:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to fetch members',
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

		// Rate limit member updates
		const rateLimitResult = await rateLimit(
			user.id,
			'update_member',
			10,
			3600
		); // 10 updates per hour
		if (!rateLimitResult.success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message:
						'Too many member update attempts. Please try again later.',
				},
				429
			);
		}

		const { teamId } = await props.params;
		const body = await request.json();

		// Validate input
		const validationError = validateUpdateMember(body);
		if (validationError) {
			return createErrorResponse(validationError);
		}

		const { memberId, teamRoleId } = body as UpdateMemberInput;

		// Get user's permissions
		const userPermissions = await getUserPermissions(user.id, teamId);

		if (!userPermissions['manageMembers'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'Insufficient permissions to update members',
				},
				403
			);
		}

		// Check if member exists and belongs to this team
		const member = await prisma.teamMember.findUnique({
			where: { id: memberId, teamId },
			include: { teamRole: true },
		});

		if (!member) {
			return createErrorResponse(
				{
					code: 'NOT_FOUND',
					message: 'Member not found',
				},
				404
			);
		}

		// Check if role exists and belongs to this team
		const role = await prisma.teamRole.findFirst({
			where: { id: teamRoleId, teamId },
		});

		if (!role) {
			return createErrorResponse(
				{
					code: 'INVALID_ROLE',
					message: 'Invalid team role',
				},
				400
			);
		}

		// Prevent changing role of last admin
		if (member.teamRole.name === 'Admin') {
			const adminCount = await prisma.teamMember.count({
				where: { teamId, teamRole: { name: 'Admin' } },
			});

			if (adminCount <= 1 && role.name !== 'Admin') {
				return createErrorResponse(
					{
						code: 'INVALID_OPERATION',
						message: 'Cannot change role of last admin',
					},
					400
				);
			}
		}

		// Update member's role
		const updatedMember = await prisma.teamMember.update({
			where: { id: memberId },
			data: { teamRoleId },
			include: { user: true, teamRole: true },
		});

		return createSuccessResponse<UpdateMemberResponse>({
			updatedMember,
		});
	} catch (error) {
		console.error('Error updating member:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to update member',
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

		// Rate limit member deletions
		const rateLimitResult = await rateLimit(
			user.id,
			'delete_member',
			5,
			3600
		); // 5 deletions per hour
		if (!rateLimitResult.success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message:
						'Too many member deletion attempts. Please try again later.',
				},
				429
			);
		}

		const { teamId } = await props.params;
		const body = await request.json();

		// Validate input
		const validationError = validateDeleteMember(body);
		if (validationError) {
			return createErrorResponse(validationError);
		}

		const { memberId } = body as DeleteMemberInput;

		// Get user's permissions
		const userPermissions = await getUserPermissions(user.id, teamId);

		if (!userPermissions['manageMembers'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'Insufficient permissions to remove members',
				},
				403
			);
		}

		// Check if member exists and belongs to this team
		const member = await prisma.teamMember.findUnique({
			where: { id: memberId, teamId },
			include: { teamRole: true },
		});

		if (!member) {
			return createErrorResponse(
				{
					code: 'NOT_FOUND',
					message: 'Member not found',
				},
				404
			);
		}

		// Prevent removing last admin
		if (member.teamRole.name === 'Admin') {
			const adminCount = await prisma.teamMember.count({
				where: { teamId, teamRole: { name: 'Admin' } },
			});

			if (adminCount <= 1) {
				return createErrorResponse(
					{
						code: 'INVALID_OPERATION',
						message: 'Cannot remove the last admin',
					},
					400
				);
			}
		}

		// Prevent removing yourself
		if (member.userId === user.id) {
			return createErrorResponse(
				{
					code: 'INVALID_OPERATION',
					message: 'Cannot remove yourself from the team',
				},
				400
			);
		}

		// Delete the member
		await prisma.teamMember.delete({
			where: { id: memberId },
		});

		return createSuccessResponse<DeleteMemberResponse>({
			message: 'Member removed successfully',
		});
	} catch (error) {
		console.error('Error removing member:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to remove member',
			},
			500
		);
	}
}
