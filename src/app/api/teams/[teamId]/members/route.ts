// src/app/api/teams/[teamId]/members/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase-db';
import type { Database } from '@/lib/supabase-db';

type TeamMember = Database['public']['Tables']['team_members']['Row'];
type TeamRole = Database['public']['Tables']['team_roles']['Row'];
type User = Database['public']['Tables']['users']['Row'];

interface TeamMemberWithRelations extends TeamMember {
	user: User;
	teamRole: TeamRole;
}

export async function GET(
	request: Request,
	props: { params: Promise<{ teamId: string }> }
) {
	const { teamId } = await props.params;

	const supabaseAuth = await createClient();
	const {
		data: { user },
		error,
	} = await supabaseAuth.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Ensure user is in the team
	const { data: teamMember, error: teamMemberError } = await supabase
		.from('team_members')
		.select('*')
		.eq('team_id', teamId)
		.eq('user_id', user.id)
		.single();

	if (teamMemberError || !teamMember) {
		return NextResponse.json(
			{ error: 'Forbidden: You are not a team member' },
			{ status: 403 }
		);
	}

	// Fetch all team members with their user and role information
	const { data: members, error: membersError } = await supabase
		.from('team_members')
		.select(
			`
			*,
			user:users(*),
			teamRole:team_roles(*)
		`
		)
		.eq('team_id', teamId);

	if (membersError) {
		console.error('Error fetching team members:', membersError);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}

	return NextResponse.json({ members });
}

export async function PATCH(request: Request) {
	const { memberId, teamRoleId } = await request.json();

	const supabaseAuth = await createClient();
	const {
		data: { user },
		error,
	} = await supabaseAuth.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Fetch current user's role & permissions
	const { data: currentUser, error: currentUserError } = await supabase
		.from('team_members')
		.select(
			`
			*,
			teamRole:team_roles(*)
		`
		)
		.eq('user_id', user.id)
		.single();

	if (currentUserError || !currentUser || !currentUser.teamRole) {
		return NextResponse.json(
			{ error: 'Forbidden: You do not have permission to edit members' },
			{ status: 403 }
		);
	}

	// Parse permissions
	const rolePermissions = currentUser.teamRole.permissions
		? JSON.parse(currentUser.teamRole.permissions)
		: {};

	const hasPermission =
		currentUser.teamRole.name === 'Admin' ||
		rolePermissions.manageMembers === true;

	if (!hasPermission) {
		return NextResponse.json(
			{ error: 'Forbidden: You do not have permission to change roles' },
			{ status: 403 }
		);
	}

	// Update member's role
	const { data: updatedMember, error: updateError } = await supabase
		.from('team_members')
		.update({
			team_role_id: teamRoleId,
			updated_at: new Date().toISOString(),
		})
		.eq('id', memberId)
		.select()
		.single();

	if (updateError) {
		console.error('Error updating team member:', updateError);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}

	return NextResponse.json({ updatedMember }, { status: 200 });
}

export async function DELETE(
	request: Request,
	props: { params: Promise<{ teamId: string }> }
) {
	const { memberId } = await request.json();
	const { teamId } = await props.params;

	const supabaseAuth = await createClient();
	const {
		data: { user },
		error,
	} = await supabaseAuth.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Fetch current user's role
	const { data: currentUser, error: currentUserError } = await supabase
		.from('team_members')
		.select(
			`
			*,
			teamRole:team_roles(*)
		`
		)
		.eq('team_id', teamId)
		.eq('user_id', user.id)
		.single();

	if (currentUserError || !currentUser || !currentUser.teamRole) {
		return NextResponse.json(
			{
				error: 'Forbidden: You do not have permission to remove members',
			},
			{ status: 403 }
		);
	}

	// Parse permissions
	const rolePermissions = currentUser.teamRole.permissions
		? JSON.parse(currentUser.teamRole.permissions)
		: {};

	const hasPermission =
		currentUser.teamRole.name === 'Admin' ||
		rolePermissions.manageMembers === true;

	if (!hasPermission) {
		return NextResponse.json(
			{
				error: 'Forbidden: You do not have permission to remove members',
			},
			{ status: 403 }
		);
	}

	// Get member to remove and check if they're an admin
	const { data: memberToRemove, error: memberError } = await supabase
		.from('team_members')
		.select(
			`
			*,
			teamRole:team_roles(*)
		`
		)
		.eq('id', memberId)
		.single();

	if (memberError || !memberToRemove || !memberToRemove.teamRole) {
		console.error('Error fetching member to remove:', memberError);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}

	// If the member is an admin, check if they're the last one
	if (memberToRemove.teamRole.name === 'Admin') {
		const { count, error: countError } = await supabase
			.from('team_members')
			.select('*', { count: 'exact', head: true })
			.eq('team_id', teamId)
			.eq('team_role_id', memberToRemove.team_role_id);

		if (countError) {
			console.error('Error counting admin members:', countError);
			return NextResponse.json(
				{ error: 'Internal Server Error' },
				{ status: 500 }
			);
		}

		if (count && count <= 1) {
			return NextResponse.json(
				{ error: 'You cannot remove the last admin.' },
				{ status: 400 }
			);
		}
	}

	// Remove the member
	const { error: deleteError } = await supabase
		.from('team_members')
		.delete()
		.eq('id', memberId);

	if (deleteError) {
		console.error('Error removing team member:', deleteError);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}

	return NextResponse.json({ message: 'Member removed' }, { status: 200 });
}
