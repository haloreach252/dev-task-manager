// src/app/api/teams/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase-db';
import {
	defaultAdminPermissions,
	defaultEditorPermissions,
	defaultViewerPermissions,
} from '@/lib/permissions';
import type { Database } from '@/lib/supabase-db';

type Team = Database['public']['Tables']['teams']['Row'];
type TeamMember = Database['public']['Tables']['team_members']['Row'];
type TeamRole = Database['public']['Tables']['team_roles']['Row'];

interface TeamWithMembers extends Team {
	members: Array<
		TeamMember & {
			teamRole: TeamRole;
		}
	>;
}

export async function GET() {
	const supabaseAuth = await createClient();
	const {
		data: { user },
		error,
	} = await supabaseAuth.auth.getUser();

	if (!user || error) {
		console.log(error ? error : 'No user found on teams page');
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const userId = user.id;

		// Fetch teams where the user is a member and count the total members
		const { data: teams, error: teamsError } = await supabase
			.from('teams')
			.select(
				`
				*,
				members:team_members(
					*,
					teamRole:team_roles(*)
				)
			`
			)
			.eq('members.user_id', userId)
			.order('name', { ascending: true });

		if (teamsError) {
			console.error('Error fetching teams:', teamsError);
			return NextResponse.json(
				{ error: 'Internal Server Error' },
				{ status: 500 }
			);
		}

		// Return teams with the users permissions
		const teamsToReturn = (teams as TeamWithMembers[]).map((team) => {
			const userMember = team.members.find(
				(member) => member.user_id === userId
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
	const supabaseAuth = await createClient();
	const {
		data: { user },
		error,
	} = await supabaseAuth.auth.getUser();

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
		const { data: existingTeam, error: existingTeamError } = await supabase
			.from('teams')
			.select('*')
			.eq('name', name)
			.single();

		if (existingTeamError && existingTeamError.code !== 'PGRST116') {
			console.error('Error checking existing team:', existingTeamError);
			return NextResponse.json(
				{ error: 'Internal Server Error' },
				{ status: 500 }
			);
		}

		if (existingTeam) {
			return NextResponse.json(
				{ error: 'A team with this name already exists.' },
				{ status: 400 }
			);
		}

		// Create the team
		const { data: team, error: teamError } = await supabase
			.from('teams')
			.insert({
				name,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.select()
			.single();

		if (teamError || !team) {
			console.error('Error creating team:', teamError);
			return NextResponse.json(
				{ error: 'Internal Server Error' },
				{ status: 500 }
			);
		}

		// Create default roles for the team
		const { data: roles, error: rolesError } = await supabase
			.from('team_roles')
			.insert([
				{
					team_id: team.id,
					name: 'Admin',
					permissions: JSON.stringify(defaultAdminPermissions),
					can_delete: false,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				},
				{
					team_id: team.id,
					name: 'Editor',
					permissions: JSON.stringify(defaultEditorPermissions),
					can_delete: false,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				},
				{
					team_id: team.id,
					name: 'Viewer',
					permissions: JSON.stringify(defaultViewerPermissions),
					can_delete: false,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				},
			])
			.select();

		if (rolesError) {
			console.error('Error creating team roles:', rolesError);
			return NextResponse.json(
				{ error: 'Internal Server Error' },
				{ status: 500 }
			);
		}

		// Find the admin role
		const adminRole = roles.find((role) => role.name === 'Admin');

		// Add the current user as a team member with the admin role
		const { error: memberError } = await supabase
			.from('team_members')
			.insert({
				team_id: team.id,
				user_id: userId,
				team_role_id: adminRole?.id,
				custom_permissions: JSON.stringify({ '*': true }),
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			});

		if (memberError) {
			console.error('Error creating team member:', memberError);
			return NextResponse.json(
				{ error: 'Internal Server Error' },
				{ status: 500 }
			);
		}

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
