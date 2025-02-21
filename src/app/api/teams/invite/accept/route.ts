import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase';

export async function POST(request: Request) {
	const { token, userId } = await request.json();
	const supabase = await createClient();

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	const invite = await prisma.invite.findUnique({
		where: { token },
	});

	if (
		!invite ||
		invite.status !== 'Pending' ||
		invite.email !== user?.email
	) {
		return NextResponse.json(
			{ error: 'Invalid or expired invite' },
			{ status: 400 }
		);
	}

	await prisma.teamMember.create({
		data: {
			userId,
			teamId: invite.teamId,
			teamRoleId:
				(
					await prisma.teamRole.findFirst({
						where: { teamId: invite.teamId, name: invite.role },
					})
				)?.id || '',
		},
	});

	await prisma.invite.update({
		where: { id: invite.id },
		data: { status: 'Accepted' },
	});

	return NextResponse.json({ message: 'Invite Accepted' }, { status: 200 });
}
