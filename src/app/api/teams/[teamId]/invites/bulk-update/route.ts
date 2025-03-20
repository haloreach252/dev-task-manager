import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase-db';
import { getUserPermissions } from '@/lib/permissions';
import type { Database } from '@/lib/supabase-db';

type Invite = Database['public']['Tables']['invites']['Row'];
type TeamRole = Database['public']['Tables']['team_roles']['Row'];

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

	// Check if user has permission to update invites
	const userPermissions = await getUserPermissions(user.id, teamId);

	if (!userPermissions['inviteMembers'] && !userPermissions['*']) {
		return NextResponse.json(
			{ error: 'Forbidden: You do not have sufficient permissions.' },
			{ status: 403 }
		);
	}

	// Get the update data from the request
	const { inviteIds, updates } = await request.json();

	if (
		!inviteIds ||
		!Array.isArray(inviteIds) ||
		inviteIds.length === 0 ||
		!updates
	) {
		return NextResponse.json(
			{ error: 'Invalid request: inviteIds and updates are required' },
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

	// If roleId is provided in updates, verify it exists
	if (updates.role) {
		const { data: role, error: roleError } = await supabase
			.from('team_roles')
			.select('*')
			.eq('id', updates.role)
			.eq('team_id', teamId)
			.single();

		if (roleError || !role) {
			return NextResponse.json(
				{ error: 'Invalid role' },
				{ status: 400 }
			);
		}
	}

	// Update the invites
	const { error: updateError } = await supabase
		.from('invites')
		.update({
			...updates,
			updated_at: new Date().toISOString(),
		})
		.eq('team_id', teamId)
		.in('id', inviteIds);

	if (updateError) {
		console.error('Error updating invites:', updateError);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}

	return NextResponse.json(
		{
			message: 'Invites updated successfully',
			count: inviteIds.length,
		},
		{ status: 200 }
	);
}
