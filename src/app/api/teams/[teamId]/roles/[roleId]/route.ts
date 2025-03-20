/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import {
	getUserMaxPermissionLevel,
	getUserPermissions,
	permissionLevels,
} from '@/lib/permissions';
import prisma from '@/lib/prisma';
import { validateUpdateRole } from '../types';
import {
	createErrorResponse,
	createSuccessResponse,
} from '@/app/api/shared/utils';
import { rateLimit } from '@/lib/rate-limit';

export async function PATCH(
	req: Request,
	props: { params: Promise<{ teamId: string; roleId: string }> }
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

		// Rate limit role updates
		const rateLimitResult = await rateLimit(
			user.id,
			'update_role',
			10,
			3600
		); // 10 updates per hour
		if (!rateLimitResult.success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message:
						'Too many role update attempts. Please try again later.',
				},
				429
			);
		}

		const { teamId, roleId } = await props.params;
		const body = await req.json();

		// Validate input
		const validationError = validateUpdateRole(body);
		if (validationError) {
			return createErrorResponse(validationError);
		}

		const { name, permissions } = body;

		// Get user's permissions
		const userPermissions = await getUserPermissions(user.id, teamId);
		const userMaxLevel = getUserMaxPermissionLevel(userPermissions);

		if (!userPermissions['manageRoles'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'Insufficient permissions to manage roles',
				},
				403
			);
		}

		// Check if role exists
		const existingRole = await prisma.teamRole.findUnique({
			where: { id: roleId, teamId },
		});

		if (!existingRole) {
			return createErrorResponse(
				{
					code: 'NOT_FOUND',
					message: 'Role not found',
				},
				404
			);
		}

		// If updating name, check for duplicates
		if (name && name !== existingRole.name) {
			const duplicateRole = await prisma.teamRole.findFirst({
				where: { teamId, name },
			});

			if (duplicateRole) {
				return createErrorResponse(
					{
						code: 'DUPLICATE_ROLE',
						message: 'A role with this name already exists',
					},
					400
				);
			}
		}

		// If updating permissions, validate them
		if (permissions) {
			const newPermissions = JSON.parse(permissions);
			for (const perm of Object.keys(newPermissions)) {
				if ((permissionLevels[perm] || 0) > userMaxLevel) {
					return createErrorResponse(
						{
							code: 'FORBIDDEN',
							message: `You cannot assign the permission "${perm}" due to insufficient permissions.`,
						},
						403
					);
				}
			}
		}

		const updatedRole = await prisma.teamRole.update({
			where: { id: roleId },
			data: {
				...(name && { name }),
				...(permissions && { permissions }),
			},
		});

		return createSuccessResponse({
			updatedRole: {
				id: updatedRole.id,
				name: updatedRole.name,
				canDelete: updatedRole.canDelete,
				permissions: JSON.parse(updatedRole.permissions),
			},
		});
	} catch (error) {
		console.error('Error updating role:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to update role',
			},
			500
		);
	}
}

export async function DELETE(
	req: Request,
	props: { params: Promise<{ teamId: string; roleId: string }> }
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

		// Rate limit role deletions
		const rateLimitResult = await rateLimit(
			user.id,
			'delete_role',
			5,
			3600
		); // 5 deletions per hour
		if (!rateLimitResult.success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message:
						'Too many role deletion attempts. Please try again later.',
				},
				429
			);
		}

		const { teamId, roleId } = await props.params;

		const userPermissions = await getUserPermissions(user.id, teamId);
		const userMaxLevel = getUserMaxPermissionLevel(userPermissions);

		if (!userPermissions['manageRoles'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'Insufficient permissions to manage roles',
				},
				403
			);
		}

		const roleToDelete = await prisma.teamRole.findUnique({
			where: { id: roleId, teamId },
		});

		if (!roleToDelete) {
			return createErrorResponse(
				{
					code: 'NOT_FOUND',
					message: 'Role not found',
				},
				404
			);
		}

		const rolePermissions = JSON.parse(roleToDelete.permissions) || {};
		const roleMaxLevel = getUserMaxPermissionLevel(rolePermissions) || 0;

		if (userMaxLevel <= roleMaxLevel && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message:
						'You do not have sufficient permissions to delete this role',
				},
				403
			);
		}

		// Check if role is in use
		const assignedMembers = await prisma.teamMember.count({
			where: { teamRoleId: roleId },
		});

		if (assignedMembers > 0) {
			return createErrorResponse(
				{
					code: 'ROLE_IN_USE',
					message:
						'Cannot delete role that is assigned to team members',
				},
				400
			);
		}

		await prisma.teamRole.delete({
			where: { id: roleId, teamId },
		});

		return createSuccessResponse({
			message: 'Role deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting role:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to delete role',
			},
			500
		);
	}
}
