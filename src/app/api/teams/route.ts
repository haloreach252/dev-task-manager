import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase';

export async function GET() {
	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (!user || error) {
		console.log(error ? error : 'No user found on teams page');
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const userId = user.id;

		const teams = await prisma.team.findMany({
			where: {
				members: { some: { userId } },
			},
		});

		return NextResponse.json({ teams });
	} catch (err) {
		console.error('Error fetching teams: ', err);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (!user || error) {
		console.error(
			error
				? 'Error on api/teams/POST:' + error
				: 'No user found on teams page'
		);
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { name } = await request.json();
		const userId = user.id;

		// Create the team and a default "Admin" role for the team
		const team = await prisma.team.create({
			data: {
				name,
				roles: {
					createMany: {
						data: [
							{ name: 'Admin', permissions: {} },
							{ name: 'Editor', permissions: {} },
							{ name: 'Viewer', permissions: {} },
						],
					},
				},
			},
		});

		// Fetch the created default admin role
		const adminRole = await prisma.teamRole.findFirst({
			where: { teamId: team.id, name: 'Admin' },
		});

		// Add the current user as a team member with the admin role
		await prisma.teamMember.create({
			data: {
				teamId: team.id,
				userId,
				teamRoleId: adminRole?.id || '',
				customPermissions: {},
			},
		});

		return NextResponse.json(team, { status: 201 });
	} catch (err) {
		console.error('Error creating team: ', err);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
