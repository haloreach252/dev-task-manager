import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase-db';
import {
	getUserPermissions,
	getUserMaxPermissionLevel,
	permissionLevels,
	type Permissions,
} from '@/lib/permissions';
import type { Database } from '@/lib/supabase-db';

type TeamRole = Database['public']['Tables']['team_roles']['Row'];

type Role = {
	id: string;
	name: string;
	canDelete: boolean;
	permissions: Permissions;
};

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

export async function GET(
	req: Request,
	props: { params: Promise<{ teamId: string }> }
) {
	const supabaseAuth = await createClient();
	const {
		data: { user },
		error,
	} = await supabaseAuth.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { teamId } = await props.params;

	try {
		const { data: roles, error: rolesError } = await supabase
			.from('team_roles')
			.select('*')
			.eq('team_id', teamId);

		if (rolesError) {
			console.error('Error fetching team roles:', rolesError);
			return NextResponse.json(
				{ error: 'Internal Server Error' },
				{ status: 500 }
			);
		}

		const transformedRoles: Role[] = (roles as TeamRole[]).map((role) => ({
			id: role.id,
			name: role.name,
			canDelete: role.can_delete,
			permissions: JSON.parse(role.permissions) as Permissions,
		}));

		return NextResponse.json({ roles: transformedRoles });
	} catch (err) {
		console.error(err);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}

export async function POST(
	req: Request,
	props: { params: Promise<{ teamId: string }> }
) {
	const { teamId } = await props.params;
	const { name, permissions } = await req.json();

	const supabaseAuth = await createClient();
	const {
		data: { user },
		error,
	} = await supabaseAuth.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Get user's permissions
	const userPermissions = await getUserPermissions(user.id, teamId);
	const userMaxLevel = getUserMaxPermissionLevel(
		flattenPermissions(userPermissions)
	);

	// Ensure user has `manageRoles`
	if (!userPermissions['manageRoles'] && !userPermissions['*']) {
		return NextResponse.json(
			{ error: 'Forbidden: Insufficient permissions' },
			{ status: 403 }
		);
	}

	// Validate new role permissions
	const newPermissions = JSON.parse(permissions) as Permissions;
	for (const perm of Object.keys(flattenPermissions(newPermissions))) {
		if ((permissionLevels[perm] || 0) > userMaxLevel) {
			return NextResponse.json(
				{
					error: `You cannot assign the permission "${perm}" because your level is too low.`,
				},
				{ status: 403 }
			);
		}
	}

	try {
		const { data: newTeamRole, error: createError } = await supabase
			.from('team_roles')
			.insert({
				name,
				permissions: JSON.stringify(newPermissions),
				team_id: teamId,
				can_delete: true,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.select()
			.single();

		if (createError) {
			console.error('Error creating team role:', createError);
			return NextResponse.json(
				{ error: 'Internal Server Error' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ newTeamRole });
	} catch (error) {
		console.error('POST /roles error:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
