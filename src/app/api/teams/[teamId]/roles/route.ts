// src/app/api/teams/[teamId]/roles/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';

export async function GET(
	request: Request,
	props: { params: Promise<{ teamId: string }> }
) {
	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (!user || error) {
		console.log(error ? error : 'No user found on teams page');
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const params = await props.params;
	const teamId = params.teamId;

	try {
		const userId = user.id;

		const team = await prisma.team.findUnique({
			where: {
				members: { some: { userId } },
				id: teamId,
			},
		});

		if (!team) {
			return NextResponse.json(
				{ error: 'Unable to find team' },
				{ status: 400 }
			);
		}

		const roles = await prisma.teamRole.findMany({
			where: {
				teamId,
			},
		});

		return NextResponse.json({ roles });
	} catch (err) {
		console.error(err);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}

export async function POST(
	request: Request,
	props: { params: Promise<{ teamId: string }> }
) {
	const params = await props.params;
	const teamId = params.teamId;
	const { name, permissions } = await request.json();

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
		console.log('api/teams/[teamId]/roles/route.ts - POST error: ', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
