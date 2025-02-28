// src/app/api/teams/[teamId]/route.ts

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

	try {
		// Check if the user is a member of the team
		const teamMember = await prisma.teamMember.findFirst({
			where: { teamId, userId: user.id },
			include: { teamRole: true },
		});

		if (!teamMember) {
			return NextResponse.json(
				{ error: 'Forbidden: You are not a member of this team' },
				{ status: 403 }
			);
		}

		// Fetch team details
		const team = await prisma.team.findUnique({
			where: { id: teamId },
			include: {
				members: {
					include: { user: true, teamRole: true },
				},
				projects: true,
			},
		});

		if (!team)
			return NextResponse.json(
				{ error: 'Team not found' },
				{ status: 404 }
			);

		// Parse permissions
		let permissions: string[] = [];
		const role = teamMember.teamRole;
		const rolePermissions = role?.permissions
			? JSON.parse(role.permissions)
			: {};

		if (role.name === 'Admin') {
			permissions = ['*'];
		} else {
			permissions = Object.keys(rolePermissions).filter(
				(key) => rolePermissions[key] === true
			);
		}

		console.log(permissions);

		return NextResponse.json({
			team: { ...team, permissions },
			members: team.members,
			projects: team.projects,
		});
	} catch (err) {
		console.error('Error fetching team:', err);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}

const editPermissions = ['*', 'editTeam', 'editDescription'];

export async function PUT(
	request: Request,
	props: { params: Promise<{ teamId: string }> }
) {
	const { teamId } = await props.params;
	const { name, description } = await request.json();

	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Fetch user role & permissions
		const teamMember = await prisma.teamMember.findFirst({
			where: { teamId, userId: user.id },
			include: { teamRole: true },
		});

		if (!teamMember) {
			return NextResponse.json(
				{ error: 'Not a team member' },
				{ status: 403 }
			);
		}

		// Parse permissions
		let permissions: string[] = [];

		const role = teamMember.teamRole;
		const rolePermissions = role?.permissions
			? JSON.parse(role.permissions)
			: {};

		if (role.name === 'Admin') {
			permissions = ['*'];
		} else {
			permissions = Object.keys(rolePermissions).filter(
				(key) => rolePermissions[key] === true
			);
		}

		const canEdit = permissions.some((r) => editPermissions.includes(r));

		if (!canEdit) {
			return NextResponse.json(
				{ error: 'You do not have permission to edit this team.' },
				{ status: 403 }
			);
		}

		if (name) {
			// Prevent duplicate team names only if `name` is changing
			const existingTeam = await prisma.team.findFirst({
				where: { name },
			});

			if (existingTeam && existingTeam.id !== teamId) {
				return NextResponse.json(
					{ error: 'A team with this name already exists.' },
					{ status: 400 }
				);
			}
		}

		const updatedTeam = await prisma.team.update({
			where: { id: teamId },
			data: {
				name: name || undefined,
				description: description || undefined,
			},
		});

		return NextResponse.json(updatedTeam, { status: 200 });
	} catch (err) {
		console.error('Error updating team name:', err);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}

export async function DELETE(
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

	try {
		// Check if user is an admin
		const teamMember = await prisma.teamMember.findFirst({
			where: { teamId, userId: user.id },
			include: { teamRole: true },
		});

		if (!teamMember || teamMember.teamRole.name !== 'Admin') {
			return NextResponse.json(
				{ error: 'You do not have permission to delete this team.' },
				{ status: 403 }
			);
		}

		// Delete the team and cascade its related data
		await prisma.team.delete({
			where: { id: teamId },
		});

		return NextResponse.json(
			{ message: 'Team deleted successfully' },
			{ status: 200 }
		);
	} catch (err) {
		console.error('Error deleting team:', err);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
