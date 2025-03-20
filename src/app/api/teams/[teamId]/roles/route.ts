import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import {
	getUserPermissions,
	getUserMaxPermissionLevel,
	permissionLevels,
} from '@/lib/permissions';
import {
	validateCreateRole,
	type CreateRoleInput,
	type Role,
	type RolesResponse,
	type CreateRoleResponse,
} from './types';
import {
	createErrorResponse,
	createSuccessResponse,
} from '@/app/api/shared/utils';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(
	req: Request,
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

		const roles = await prisma.teamRole.findMany({ where: { teamId } });

		const transformedRoles: Role[] = roles.map((role) => ({
			id: role.id,
			name: role.name,
			canDelete: role.canDelete,
			permissions: JSON.parse(role.permissions),
		}));

		return createSuccessResponse<RolesResponse>({
			roles: transformedRoles,
		});
	} catch (error) {
		console.error('Error fetching roles:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to fetch roles',
			},
			500
		);
	}
}

export async function POST(
	req: Request,
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

		// Rate limit role creation
		const rateLimitResult = await rateLimit(
			user.id,
			'create_role',
			5,
			3600
		); // 5 roles per hour
		if (!rateLimitResult.success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message:
						'Too many role creation attempts. Please try again later.',
				},
				429
			);
		}

		const { teamId } = await props.params;
		const body = await req.json();

		// Validate input
		const validationError = validateCreateRole(body);
		if (validationError) {
			return createErrorResponse(validationError);
		}

		const { name, permissions } = body as CreateRoleInput;

		// Get user's permissions
		const userPermissions = await getUserPermissions(user.id, teamId);
		const userMaxLevel = getUserMaxPermissionLevel(userPermissions);

		// Ensure user has `manageRoles`
		if (!userPermissions['manageRoles'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'Insufficient permissions to manage roles',
				},
				403
			);
		}

		// Validate new role permissions
		const newPermissions = JSON.parse(permissions);
		for (const perm of Object.keys(newPermissions)) {
			if ((permissionLevels[perm] || 0) > userMaxLevel) {
				return createErrorResponse(
					{
						code: 'FORBIDDEN',
						message: `You cannot assign the permission "${perm}" because your level is too low.`,
					},
					403
				);
			}
		}

		// Check if role name already exists
		const existingRole = await prisma.teamRole.findFirst({
			where: { teamId, name },
		});

		if (existingRole) {
			return createErrorResponse(
				{
					code: 'DUPLICATE_ROLE',
					message: 'A role with this name already exists',
				},
				400
			);
		}

		const newTeamRole = await prisma.teamRole.create({
			data: {
				name,
				permissions,
				teamId,
			},
		});

		return createSuccessResponse<CreateRoleResponse>({
			newTeamRole: {
				id: newTeamRole.id,
				name: newTeamRole.name,
				canDelete: newTeamRole.canDelete,
				permissions: JSON.parse(newTeamRole.permissions),
			},
		});
	} catch (error) {
		console.error('Error creating role:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to create role',
			},
			500
		);
	}
}
