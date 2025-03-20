import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import {
	createErrorResponse,
	createSuccessResponse,
} from '@/app/api/shared/utils';
import { rateLimit } from '@/lib/rate-limit';
import { nanoid } from 'nanoid';

const CreateInviteSchema = z.object({
	teamId: z.string().min(1, 'Team ID is required'),
	email: z.string().email('Invalid email address'),
	role: z.string().min(1, 'Role is required'),
	expiresIn: z.number().min(1).max(168).optional(), // Hours, max 1 week
});

type CreateInviteInput = z.infer<typeof CreateInviteSchema>;

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

		// Rate limit invite creation
		const rateLimitResult = await rateLimit(
			user.id,
			'create_invite',
			10,
			3600
		); // 10 invites per hour
		if (!rateLimitResult.success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message:
						'Too many invite creation attempts. Please try again later.',
				},
				429
			);
		}

		const body = await request.json();

		// Validate input
		try {
			CreateInviteSchema.parse(body);
		} catch (error) {
			if (error instanceof z.ZodError) {
				return createErrorResponse(
					{
						code: 'VALIDATION_ERROR',
						message: error.errors[0].message,
					},
					400
				);
			}
		}

		const {
			teamId,
			email,
			role,
			expiresIn = 24,
		} = body as CreateInviteInput;

		// Check if user has permission to invite to this team
		const teamMember = await prisma.teamMember.findFirst({
			where: {
				teamId,
				userId: user.id,
			},
			include: {
				teamRole: true,
			},
		});

		if (!teamMember) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message:
						'You do not have permission to invite members to this team',
				},
				403
			);
		}

		// Check if user has invite permissions
		const permissions = JSON.parse(teamMember.teamRole.permissions);
		if (!permissions.canInviteMembers) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message:
						'You do not have permission to invite members to this team',
				},
				403
			);
		}

		// Check if the role exists and is valid for this team
		const teamRole = await prisma.teamRole.findFirst({
			where: { id: role, teamId },
		});

		if (!teamRole) {
			return createErrorResponse(
				{
					code: 'INVALID_ROLE',
					message: 'Invalid team role',
				},
				400
			);
		}

		// Check if user is already a member
		const existingMember = await prisma.teamMember.findFirst({
			where: {
				teamId,
				user: {
					email,
				},
			},
		});

		if (existingMember) {
			return createErrorResponse(
				{
					code: 'ALREADY_MEMBER',
					message: 'User is already a member of this team',
				},
				400
			);
		}

		// Check if there's an active invite for this email
		const existingInvite = await prisma.invite.findFirst({
			where: {
				teamId,
				email,
				status: 'Pending',
				expiresAt: {
					gt: new Date(),
				},
			},
		});

		if (existingInvite) {
			return createErrorResponse(
				{
					code: 'INVITE_EXISTS',
					message: 'An active invite already exists for this email',
				},
				400
			);
		}

		// Create the invite
		const invite = await prisma.invite.create({
			data: {
				teamId,
				email,
				role,
				token: nanoid(32),
				status: 'Pending',
				expiresAt: new Date(Date.now() + expiresIn * 60 * 60 * 1000),
			},
		});

		// TODO: Send invite email here

		return createSuccessResponse({
			message: 'Invite created successfully',
			inviteId: invite.id,
		});
	} catch (error) {
		console.error('Error creating invite:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to create invite',
			},
			500
		);
	}
}
