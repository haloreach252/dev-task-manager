import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { getUserPermissions } from '@/lib/permissions';
import {
	createErrorResponse,
	createSuccessResponse,
} from '@/app/api/shared/utils';
import { rateLimit } from '@/lib/rate-limit';

export type ExpireInviteResponse = {
	message: string;
};

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

		// Rate limit invite expirations
		const rateLimitResult = await rateLimit(
			user.id,
			'expire_invite',
			10,
			3600
		); // 10 expirations per hour
		if (!rateLimitResult.success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message:
						'Too many invite expiration attempts. Please try again later.',
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
					message: 'Insufficient permissions to expire invites',
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

		// Check if invite is already expired or accepted
		if (invite.status === 'Expired' || invite.status === 'Accepted') {
			return createErrorResponse(
				{
					code: 'INVALID_STATE',
					message: 'Invite is already expired or accepted',
				},
				400
			);
		}

		// Expire the invite
		await prisma.invite.update({
			where: { id: inviteId },
			data: {
				status: 'Expired',
				expiresAt: new Date(),
			},
		});

		return createSuccessResponse<ExpireInviteResponse>({
			message: 'Invite expired successfully',
		});
	} catch (error) {
		console.error('Error expiring invite:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to expire invite',
			},
			500
		);
	}
}
