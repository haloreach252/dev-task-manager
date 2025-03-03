import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase';

export async function POST(request: Request) {
	const { token } = await request.json();
	const supabase = await createClient();

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Fetch the invite
	const invite = await prisma.invite.findUnique({
		where: { token },
	});

	if (!invite) {
		return NextResponse.json({ error: 'Invalid invite' }, { status: 400 });
	}

	// Check if invite is expired
	if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
		return NextResponse.json(
			{ error: 'Invite has expired' },
			{ status: 400 }
		);
	}

	// Ensure invite matches the authenticated user's email
	if (invite.email !== user.email) {
		return NextResponse.json(
			{ error: 'Invite does not match your email' },
			{ status: 403 }
		);
	}

	// Check if the user is already a member of the team
	const existingMember = await prisma.teamMember.findFirst({
		where: { teamId: invite.teamId, userId: user.id },
	});

	if (existingMember) {
		return NextResponse.json(
			{ error: 'You are already a member of this team' },
			{ status: 400 }
		);
	}

	// Fetch the team role
	const teamRole = await prisma.teamRole.findFirst({
		where: { teamId: invite.teamId, id: invite.role },
	});

	if (!teamRole) {
		return NextResponse.json(
			{ error: 'Invalid team role. Contact the team admin.' },
			{ status: 400 }
		);
	}

	// Add user to the team
	await prisma.teamMember.create({
		data: {
			userId: user.id,
			teamId: invite.teamId,
			teamRoleId: teamRole.id,
			customPermissions: '{}',
		},
	});

	// Update the invite status
	await prisma.invite.update({
		where: { id: invite.id },
		data: { status: 'Accepted' },
	});

	return NextResponse.json({ message: 'Invite Accepted' }, { status: 200 });
}
