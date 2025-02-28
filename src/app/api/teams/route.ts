// src/app/api/teams/route.ts

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
				members: {
					include: {
						teamRole: true,
					},
				},
			},
			orderBy: { name: 'asc' }, // Sort alphabetically
		});

		// Return teams with the users permissions
		const teamsToReturn = teams.map((team) => {
			const userMember = team.members.find(
				(member) => member.userId === userId
			);

			let permissions: string[] = [];
			if (userMember) {
				const role = userMember.teamRole;
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
			}

			return {
				id: team.id,
				name: team.name,
				description: team.description,
				totalMembers: team.members.length,
				permissions,
			};
		});

		return NextResponse.json({ teams: teamsToReturn });
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
							{
								name: 'Admin',
								permissions: JSON.stringify({ '*': true }),
							},
							{ name: 'Editor', permissions: JSON.stringify({}) },
							{ name: 'Viewer', permissions: JSON.stringify({}) },
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
				customPermissions: JSON.stringify({ '*': true }),
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
