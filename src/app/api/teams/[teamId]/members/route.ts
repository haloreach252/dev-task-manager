// src/app/api/teams/[teamId]/members/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase';

export async function GET(
	request: Request,
	props: { params: Promise<{ teamId: string }> }
) {
	const { teamId } = await props.params;

	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Ensure user is in the team
	const teamMember = await prisma.teamMember.findFirst({
		where: { teamId, userId: user.id },
	});

	if (!teamMember) {
		return NextResponse.json(
			{ error: 'Forbidden: You are not a team member' },
			{ status: 403 }
		);
	}

	const members = await prisma.teamMember.findMany({
		where: { teamId },
		include: { user: true, teamRole: true },
	});

	return NextResponse.json({ members });
}

export async function PATCH(request: Request) {
	const { memberId, teamRoleId } = await request.json();

	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Fetch current user's role & permissions
	const currentUser = await prisma.teamMember.findFirst({
		where: { userId: user.id },
		include: { teamRole: true },
	});

	if (!currentUser || !currentUser.teamRole) {
		return NextResponse.json(
			{ error: 'Forbidden: You do not have permission to edit members' },
			{ status: 403 }
		);
	}

	// Parse permissions
	const rolePermissions = currentUser.teamRole.permissions
		? JSON.parse(currentUser.teamRole.permissions)
		: {};

	const hasPermission =
		currentUser.teamRole.name === 'Admin' ||
		rolePermissions.manageMembers === true;

	if (!hasPermission) {
		return NextResponse.json(
			{ error: 'Forbidden: You do not have permission to change roles' },
			{ status: 403 }
		);
	}

	const updatedMember = await prisma.teamMember.update({
		where: { id: memberId },
		data: { teamRoleId },
	});

	return NextResponse.json({ updatedMember }, { status: 200 });
}

export async function DELETE(
	request: Request,
	props: { params: Promise<{ teamId: string }> }
) {
	const { memberId } = await request.json();
	const { teamId } = await props.params;

	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Fetch current user's role
	const currentUser = await prisma.teamMember.findFirst({
		where: { teamId, userId: user.id },
		include: { teamRole: true },
	});

	if (!currentUser || !currentUser.teamRole) {
		return NextResponse.json(
			{
				error: 'Forbidden: You do not have permission to remove members',
			},
			{ status: 403 }
		);
	}

	// Parse permissions
	const rolePermissions = currentUser.teamRole.permissions
		? JSON.parse(currentUser.teamRole.permissions)
		: {};

	const hasPermission =
		currentUser.teamRole.name === 'Admin' ||
		rolePermissions.manageMembers === true;

	if (!hasPermission) {
		return NextResponse.json(
			{
				error: 'Forbidden: You do not have permission to remove members',
			},
			{ status: 403 }
		);
	}

	// Prevent removing last admin
	const adminCount = await prisma.teamMember.count({
		where: { teamId, teamRole: { name: 'Admin' } },
	});

	const memberToRemove = await prisma.teamMember.findUnique({
		where: { id: memberId },
		include: { teamRole: true },
	});

	if (memberToRemove?.teamRole.name === 'Admin' && adminCount <= 1) {
		return NextResponse.json(
			{ error: 'You cannot remove the last admin.' },
			{ status: 400 }
		);
	}

	await prisma.teamMember.delete({ where: { id: memberId } });

	return NextResponse.json({ message: 'Member removed' }, { status: 200 });
}
