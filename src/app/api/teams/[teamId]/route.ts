import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase';

export async function GET(
	request: Request,
	props: { params: Promise<{ teamId: string }> }
) {
	const { teamId } = await props.params;

	try {
		const team = await prisma.team.findUnique({
			where: { id: teamId },
			include: { members: true },
		});

		if (!team) {
			return NextResponse.json({ error: 'Team not found' }, { status: 404 });
		}

		const teamToReturn = {
			id: team.id,
			name: team.name,
			totalMembers: team.members.length
		};

		// Return team with member count
		return NextResponse.json({
			team: teamToReturn
		});
	} catch (err) {
		console.error('Error fetching team:', err);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function PUT(
	request: Request,
	props: { params: Promise<{ teamId: string }> }
) {
	const { teamId } = await props.params;
	const { name } = await request.json();

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
				{ error: 'You do not have permission to edit this team.' },
				{ status: 403 }
			);
		}

		// Prevent duplicate team names
		const existingTeam = await prisma.team.findFirst({
			where: { name },
		});

		if (existingTeam && existingTeam.id !== teamId) {
			return NextResponse.json(
				{ error: 'A team with this name already exists.' },
				{ status: 400 }
			);
		}

		const updatedTeam = await prisma.team.update({
			where: { id: teamId },
			data: { name },
		});

		return NextResponse.json(updatedTeam, { status: 200 });
	} catch (err) {
		console.error('Error updating team name:', err);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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

		return NextResponse.json({ message: 'Team deleted successfully' }, { status: 200 });
	} catch (err) {
		console.error('Error deleting team:', err);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
