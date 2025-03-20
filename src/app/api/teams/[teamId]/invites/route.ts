import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { getUserPermissions } from '@/lib/permissions';
import {
	createErrorResponse,
	createSuccessResponse,
} from '@/app/api/shared/utils';
import { rateLimit } from '@/lib/rate-limit';

export type Invite = {
	id: string;
	email: string;
	role: string;
	status: string;
	createdAt: Date;
	expiresAt: Date | null;
};

export type InvitesResponse = {
	invites: Invite[];
};

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

		if (!userPermissions['inviteMembers'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'Insufficient permissions to view invites',
				},
				403
			);
		}

		const invites = await prisma.invite.findMany({
			where: { teamId },
			orderBy: { createdAt: 'desc' },
		});

		return createSuccessResponse<InvitesResponse>({
			invites: invites.map((invite) => ({
				id: invite.id,
				email: invite.email,
				role: invite.role,
				status: invite.status,
				createdAt: invite.createdAt,
				expiresAt: invite.expiresAt,
			})),
		});
	} catch (error) {
		console.error('Error fetching invites:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to fetch invites',
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

		// Rate limit invite deletions
		const rateLimitResult = await rateLimit(
			user.id,
			'delete_invite',
			10,
			3600
		); // 10 deletions per hour
		if (!rateLimitResult.success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message:
						'Too many invite deletion attempts. Please try again later.',
				},
				429
			);
		}

		const { teamId } = await props.params;
		const { inviteId } = await request.json();

		if (!inviteId) {
			return createErrorResponse(
				{
					code: 'VALIDATION_ERROR',
					message: 'Invite ID is required',
				},
				400
			);
		}

		// Get user's permissions
		const userPermissions = await getUserPermissions(user.id, teamId);

		if (!userPermissions['inviteMembers'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'Insufficient permissions to delete invites',
				},
				403
			);
		}

		// Check if invite exists and belongs to this team
		const invite = await prisma.invite.findUnique({
			where: { id: inviteId, teamId },
		});

		if (!invite) {
			return createErrorResponse(
				{
					code: 'NOT_FOUND',
					message: 'Invite not found',
				},
				404
			);
		}

		// Delete the invite
		await prisma.invite.delete({
			where: { id: inviteId },
		});

		return createSuccessResponse({
			message: 'Invite deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting invite:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to delete invite',
			},
			500
		);
	}
}
