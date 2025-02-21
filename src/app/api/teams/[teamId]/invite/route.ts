import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

export async function POST(
	request: Request,
	props: { params: Promise<{ teamId: string }> }
) {
	const params = await props.params;
	const { email, role = 'Viewer' } = await request.json();
	const token = nanoid(32);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const invite = await prisma.invite.create({
		data: {
			email,
			token,
			role,
			status: 'Pending',
			teamId: params.teamId,
		},
	});

	const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL}/invite/${token}`;

	return NextResponse.json({ inviteLink }, { status: 201 });
}
