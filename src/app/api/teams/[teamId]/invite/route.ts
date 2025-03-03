// src/app/api/teams/[teamId]/invite/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { createClient } from '@/lib/supabase';
import { getUserPermissions } from '@/lib/permissions';

export async function POST(
	request: Request,
	props: { params: Promise<{ teamId: string }> }
) {
	const { teamId } = await props.params;

	const supabase = await createClient();
	const { data: { user }, error } = await supabase.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
	}

	const userPermissions = await getUserPermissions(user.id, teamId);

	if (!userPermissions['inviteMembers'] && !userPermissions['*']) {
		return NextResponse.json({ error: "Forbidden: You do not have sufficient permissions." }, { status: 403 });
	}
	
	// TODO: Change this to use roleId instead of a set name
	//       so that the invite can be sent with a custom role
	const { email, role = 'Viewer' } = await request.json();
	const token = nanoid(32);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const invite = await prisma.invite.create({
		data: {
			email,
			token,
			role,
			status: 'Pending',
			teamId,
		},
	});

	const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL}/invite/${token}`;

	return NextResponse.json({ inviteLink }, { status: 201 });
}
