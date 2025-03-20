import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { validateAcceptInvite } from '../types';
import {
	createErrorResponse,
	createSuccessResponse,
} from '@/app/api/shared/utils';
import { rateLimit } from '@/lib/rate-limit';

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

		// Rate limit invite acceptance
		const rateLimitResult = await rateLimit(
			user.id,
			'accept_invite',
			5,
			3600
		); // 5 accepts per hour
		if (!rateLimitResult.success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message:
						'Too many invite acceptance attempts. Please try again later.',
				},
				429
			);
		}

		const body = await request.json();

		// Validate input
		const validationError = validateAcceptInvite(body);
		if (validationError) {
			return createErrorResponse(validationError);
		}

		// Fetch the invite
		const invite = await prisma.invite.findUnique({
			where: { token: body.token },
		});

		if (!invite) {
			return createErrorResponse(
				{
					code: 'INVALID_INVITE',
					message: 'Invalid invite',
				},
				400
			);
		}

		// Check if invite is expired
		if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
			return createErrorResponse(
				{
					code: 'EXPIRED_INVITE',
					message: 'Invite has expired',
				},
				400
			);
		}

		// Ensure invite matches the authenticated user's email
		if (invite.email !== user.email) {
			return createErrorResponse(
				{
					code: 'INVALID_EMAIL',
					message: 'Invite does not match your email',
				},
				403
			);
		}

		// Check if the user is already a member of the team
		const existingMember = await prisma.teamMember.findFirst({
			where: { teamId: invite.teamId, userId: user.id },
		});

		if (existingMember) {
			return createErrorResponse(
				{
					code: 'ALREADY_MEMBER',
					message: 'You are already a member of this team',
				},
				400
			);
		}

		// Fetch the team role
		const teamRole = await prisma.teamRole.findFirst({
			where: { teamId: invite.teamId, id: invite.role },
		});

		if (!teamRole) {
			return createErrorResponse(
				{
					code: 'INVALID_ROLE',
					message: 'Invalid team role. Contact the team admin.',
				},
				400
			);
		}

		// Add user to the team and update invite status in a transaction
		await prisma.$transaction(async (tx) => {
			// Add user to the team
			await tx.teamMember.create({
				data: {
					userId: user.id,
					teamId: invite.teamId,
					teamRoleId: teamRole.id,
					customPermissions: '{}',
				},
			});

			// Update the invite status
			await tx.invite.update({
				where: { id: invite.id },
				data: { status: 'Accepted' },
			});
		});

		return createSuccessResponse({
			message: 'Invite accepted successfully',
		});
	} catch (error) {
		console.error('Error accepting invite:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to accept invite',
			},
			500
		);
	}
}
