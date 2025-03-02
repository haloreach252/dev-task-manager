import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';

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

	// Check if user has permission to manage roles
	const teamMember = await prisma.teamMember.findFirst({
		where: { teamId, userId: user.id },
		include: { teamRole: true },
	});

	if (!teamMember) {
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
	}

	const rolePermissions = teamMember.teamRole.permissions
		? JSON.parse(teamMember.teamRole.permissions)
		: {};
	const hasPermission =
		teamMember.teamRole.name === 'Admin' ||
		rolePermissions.manageMembers === true;

	if (!hasPermission) {
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
