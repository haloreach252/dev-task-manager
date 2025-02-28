// src/app/api/teams/[teamId]/members/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
	request: Request,
	props: { params: Promise<{ teamId: string }> }
) {
	const params = await props.params;
	const members = await prisma.teamMember.findMany({
		where: { teamId: params.teamId },
		include: { user: true, teamRole: true },
	});
	return NextResponse.json({ members });
}

export async function PATCH(request: Request) {
	const { memberId, teamRoleId, customPermissions } = await request.json();

	const updatedMember = await prisma.teamMember.update({
		where: { id: memberId },
		data: {
			teamRoleId,
			customPermissions,
		},
	});

	return NextResponse.json({ updatedMember }, { status: 200 });
}

export async function DELETE(
	request: Request,
	props: { params: Promise<{ teamId: string }> }
) {
	const { memberId } = await request.json();
	const params = await props.params;
	const teamId = params.teamId;

	await prisma.teamMember.delete({ where: { id: memberId, teamId } });

	return NextResponse.json({ message: 'Member removed' }, { status: 200 });
}
