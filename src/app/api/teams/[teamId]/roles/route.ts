import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import {
	getUserPermissions,
	getUserMaxPermissionLevel,
	permissionLevels,
} from '@/lib/permissions';

type Role = {
	id: string;
	name: string;
	permissions: Record<string, any>;
};

export async function GET(
	req: Request,
	props: { params: Promise<{ teamId: string }> }
) {
	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { teamId } = await props.params;

	try {
		const roles = await prisma.teamRole.findMany({ where: { teamId } });

		const transformedRoles: Role[] = [];
		roles.forEach((role) => {
			const fixedRole = {
				id: role.id,
				name: role.name,
				permissions: JSON.parse(role.permissions),
			};
			transformedRoles.push(fixedRole);
		});

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

	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Get user's permissions
	const userPermissions = await getUserPermissions(user.id, teamId);
	const userMaxLevel = getUserMaxPermissionLevel(userPermissions);

	// Ensure user has `manageRoles`
	if (!userPermissions['manageRoles'] && !userPermissions['*']) {
		return NextResponse.json(
			{ error: 'Forbidden: Insufficient permissions' },
			{ status: 403 }
		);
	}

	// Validate new role permissions
	const newPermissions = JSON.parse(permissions);
	for (const perm of Object.keys(newPermissions)) {
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
		const newTeamRole = await prisma.teamRole.create({
			data: {
				name,
				permissions,
				teamId,
			},
		});

		return NextResponse.json({ newTeamRole });
	} catch (error) {
		console.error('POST /roles error:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
