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

		// Fetch teams where the user is a member and count the total members
		const teams = await prisma.team.findMany({
			where: {
				members: { some: { userId } },
			},
			include: {
				members: true, // Fetch members to count total members
			},
			orderBy: { name: 'asc' }, // Sort alphabetically
		});

		// Return teams with member count
		const teamsWithMemberCount = teams.map(team => ({
			id: team.id,
			name: team.name,
			totalMembers: team.members.length,
		}));

		return NextResponse.json({ teams: teamsWithMemberCount });
	} catch (err) {
		console.error('Error fetching teams:', err);
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

		// Prevent duplicate team names
		const existingTeam = await prisma.team.findFirst({
			where: { name },
		});

		if (existingTeam) {
			return NextResponse.json(
				{ error: 'A team with this name already exists.' },
				{ status: 400 }
			);
		}

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

		// Return team with member count
		return NextResponse.json(
			{
				id: team.id,
				name: team.name,
				totalMembers: 1, // Since the creator is the first member
			},
			{ status: 201 }
		);
	} catch (err) {
		console.error('Error creating team:', err);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
