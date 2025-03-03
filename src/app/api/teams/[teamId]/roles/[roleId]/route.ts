/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import {
	getUserMaxPermissionLevel,
	getUserPermissions,
	permissionLevels,
} from '@/lib/permissions';
import prisma from '@/lib/prisma';

export async function PATCH(
	req: Request,
	props: { params: Promise<{ teamId: string; roleId: string }> }
) {
	const { teamId, roleId } = await props.params;
	const { name, permissions } = await req.json();

	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const userPermissions = await getUserPermissions(user.id, teamId);
	const userMaxLevel = getUserMaxPermissionLevel(userPermissions);

	if (!userPermissions['manageRoles'] && !userPermissions['*']) {
		return NextResponse.json(
			{ error: 'Forbidden: Insufficient permissions.' },
			{ status: 403 }
		);
	}

	const newPermissions = JSON.parse(permissions);
	for (const perm of Object.keys(newPermissions)) {
		if ((permissionLevels[perm] || 0) > userMaxLevel) {
			return NextResponse.json(
				{
					error: `You cannot assign the permission "${perm}" due to insufficient permissions.`,
				},
				{ status: 403 }
			);
		}
	}

	try {
		const updatedRole = await prisma.teamRole.update({
			where: { id: roleId },
			data: { name, permissions },
		});

		return NextResponse.json({ updatedRole });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	req: Request,
	props: { params: Promise<{ teamId: string; roleId: string }> }
) {
	const { teamId, roleId } = await props.params;

	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const userPermissions = await getUserPermissions(user.id, teamId);
	const userMaxLevel = getUserMaxPermissionLevel(userPermissions);

	if (!userPermissions['manageRoles'] && !userPermissions['*']) {
		return NextResponse.json(
			{ error: 'Forbidden: Insufficient permissions.' },
			{ status: 403 }
		);
	}

	const roleToDelete = await prisma.teamRole.findUnique({
		where: { id: roleId, teamId },
	});

	if (!roleToDelete) {
		return NextResponse.json({ error: 'Role not found' }, { status: 404 });
	}

	const rolePermissions = JSON.parse(roleToDelete.permissions) || {};

	const roleMaxLevel = getUserMaxPermissionLevel(rolePermissions) || 0;

	if (userMaxLevel <= roleMaxLevel && !userPermissions['*']) {
		return NextResponse.json(
			{ error: 'Not enough permissions' },
			{ status: 403 }
		);
	}

	const assignedMembers = await prisma.teamMember.count({
		where: { teamRoleId: roleId },
	});

	if (assignedMembers > 0) {
		return NextResponse.json(
			{ error: 'Role is in use and cannot be deleted.' },
			{ status: 400 }
		);
	}

	try {
		await prisma.teamRole.delete({
			where: { id: roleId, teamId },
		});

		return NextResponse.json(
			{ message: 'Role deleted successfully' },
			{ status: 200 }
		);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
