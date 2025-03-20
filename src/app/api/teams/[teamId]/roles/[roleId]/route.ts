/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase-db';
import {
	getUserMaxPermissionLevel,
	getUserPermissions,
	permissionLevels,
	type Permissions,
} from '@/lib/permissions';
import type { Database } from '@/lib/supabase-db';

type TeamRole = Database['public']['Tables']['team_roles']['Row'];

// Helper function to convert nested permissions to a flat boolean record
function flattenPermissions(permissions: Permissions): Record<string, boolean> {
	const result: Record<string, boolean> = {};
	for (const [key, value] of Object.entries(permissions)) {
		if (typeof value === 'boolean') {
			result[key] = value;
		} else if (typeof value === 'object') {
			Object.assign(result, flattenPermissions(value));
		}
	}
	return result;
}

export async function PATCH(
	req: Request,
	props: { params: Promise<{ teamId: string; roleId: string }> }
) {
	const { teamId, roleId } = await props.params;
	const { name, permissions } = await req.json();

	const supabaseAuth = await createClient();
	const {
		data: { user },
		error,
	} = await supabaseAuth.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const userPermissions = await getUserPermissions(user.id, teamId);
	const userMaxLevel = getUserMaxPermissionLevel(
		flattenPermissions(userPermissions)
	);

	if (!userPermissions['manageRoles'] && !userPermissions['*']) {
		return NextResponse.json(
			{ error: 'Forbidden: Insufficient permissions.' },
			{ status: 403 }
		);
	}

	const newPermissions = JSON.parse(permissions) as Permissions;
	for (const perm of Object.keys(flattenPermissions(newPermissions))) {
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
		const { data: updatedRole, error: updateError } = await supabase
			.from('team_roles')
			.update({
				name,
				permissions: JSON.stringify(newPermissions),
				updated_at: new Date().toISOString(),
			})
			.eq('id', roleId)
			.eq('team_id', teamId)
			.select()
			.single();

		if (updateError) {
			console.error('Error updating role:', updateError);
			return NextResponse.json(
				{ error: 'Internal Server Error' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ updatedRole });
	} catch (error) {
		console.error('Error in PATCH /roles/[roleId]:', error);
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

	const supabaseAuth = await createClient();
	const {
		data: { user },
		error,
	} = await supabaseAuth.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const userPermissions = await getUserPermissions(user.id, teamId);
	const userMaxLevel = getUserMaxPermissionLevel(
		flattenPermissions(userPermissions)
	);

	if (!userPermissions['manageRoles'] && !userPermissions['*']) {
		return NextResponse.json(
			{ error: 'Forbidden: Insufficient permissions.' },
			{ status: 403 }
		);
	}

	// Get the role to delete
	const { data: roleToDelete, error: roleError } = await supabase
		.from('team_roles')
		.select('*')
		.eq('id', roleId)
		.eq('team_id', teamId)
		.single();

	if (roleError || !roleToDelete) {
		return NextResponse.json({ error: 'Role not found' }, { status: 404 });
	}

	const rolePermissions = JSON.parse(roleToDelete.permissions) as Permissions;
	const roleMaxLevel =
		getUserMaxPermissionLevel(flattenPermissions(rolePermissions)) || 0;

	if (userMaxLevel <= roleMaxLevel && !userPermissions['*']) {
		return NextResponse.json(
			{ error: 'Not enough permissions' },
			{ status: 403 }
		);
	}

	// Check if the role is assigned to any members
	const { count, error: countError } = await supabase
		.from('team_members')
		.select('*', { count: 'exact', head: true })
		.eq('team_role_id', roleId);

	if (countError) {
		console.error('Error checking role assignments:', countError);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}

	if (count && count > 0) {
		return NextResponse.json(
			{ error: 'Role is in use and cannot be deleted.' },
			{ status: 400 }
		);
	}

	try {
		const { error: deleteError } = await supabase
			.from('team_roles')
			.delete()
			.eq('id', roleId)
			.eq('team_id', teamId);

		if (deleteError) {
			console.error('Error deleting role:', deleteError);
			return NextResponse.json(
				{ error: 'Internal Server Error' },
				{ status: 500 }
			);
		}

		return NextResponse.json(
			{ message: 'Role deleted successfully' },
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error in DELETE /roles/[roleId]:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
