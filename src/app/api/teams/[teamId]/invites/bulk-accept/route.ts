import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase-db';
import { getUserPermissions } from '@/lib/permissions';
import type { Database } from '@/lib/supabase-db';

type Invite = Database['public']['Tables']['invites']['Row'];

export async function POST(
	request: Request,
	props: { params: Promise<{ teamId: string }> }
) {
	const { teamId } = await props.params;
	const supabaseAuth = await createClient();

	const {
		data: { user },
		error,
	} = await supabaseAuth.auth.getUser();

	if (error || !user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Get the invite IDs from the request
	const { inviteIds } = await request.json();

	if (!inviteIds || !Array.isArray(inviteIds) || inviteIds.length === 0) {
		return NextResponse.json(
			{ error: 'Invalid request: inviteIds is required' },
			{ status: 400 }
		);
	}

	// Fetch the invites to verify they belong to the team and are for the current user
	const { data: invites, error: invitesError } = await supabase
		.from('invites')
		.select('*')
		.eq('team_id', teamId)
		.eq('email', user.email)
		.in('id', inviteIds);

	if (invitesError) {
		console.error('Error fetching invites:', invitesError);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}

	if (!invites || invites.length !== inviteIds.length) {
		return NextResponse.json(
			{
				error: 'Some invites were not found or do not belong to this team',
			},
			{ status: 400 }
		);
	}

	// Check if any invites are expired or already accepted/rejected
	const invalidInvites = invites.filter(
		(invite) =>
			invite.status !== 'Pending' ||
			new Date(invite.expires_at) < new Date()
	);

	if (invalidInvites.length > 0) {
		return NextResponse.json(
			{ error: 'Some invites are expired or already processed' },
			{ status: 400 }
		);
	}

	// Start a transaction to update invites and create team memberships
	const { error: updateError } = await supabase
		.from('invites')
		.update({
			status: 'Accepted',
			updated_at: new Date().toISOString(),
		})
		.eq('team_id', teamId)
		.in('id', inviteIds);

	if (updateError) {
		console.error('Error accepting invites:', updateError);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}

	// Create team memberships for each accepted invite
	const teamMemberships = invites.map((invite) => ({
		team_id: teamId,
		user_id: user.id,
		role_id: invite.role_id,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	}));

	const { error: membershipError } = await supabase
		.from('team_members')
		.insert(teamMemberships);

	if (membershipError) {
		console.error('Error creating team memberships:', membershipError);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}

	return NextResponse.json(
		{
			message: 'Invites accepted successfully',
			count: inviteIds.length,
		},
		{ status: 200 }
	);
}
