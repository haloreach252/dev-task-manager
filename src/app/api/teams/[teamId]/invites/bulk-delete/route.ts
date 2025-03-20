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

	// Check if user has permission to delete invites
	const userPermissions = await getUserPermissions(user.id, teamId);

	if (!userPermissions['inviteMembers'] && !userPermissions['*']) {
		return NextResponse.json(
			{ error: 'Forbidden: You do not have sufficient permissions.' },
			{ status: 403 }
		);
	}

	// Get the invite IDs from the request
	const { inviteIds } = await request.json();

	if (!inviteIds || !Array.isArray(inviteIds) || inviteIds.length === 0) {
		return NextResponse.json(
			{ error: 'Invalid request: inviteIds is required' },
			{ status: 400 }
		);
	}

	// Fetch the invites to verify they belong to the team
	const { data: invites, error: invitesError } = await supabase
		.from('invites')
		.select('*')
		.eq('team_id', teamId)
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

	// Delete the invites
	const { error: deleteError } = await supabase
		.from('invites')
		.delete()
		.eq('team_id', teamId)
		.in('id', inviteIds);

	if (deleteError) {
		console.error('Error deleting invites:', deleteError);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}

	return NextResponse.json(
		{
			message: 'Invites deleted successfully',
			count: inviteIds.length,
		},
		{ status: 200 }
	);
}
