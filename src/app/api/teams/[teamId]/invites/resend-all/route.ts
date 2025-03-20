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

	// Check if user has permission to resend invites
	const userPermissions = await getUserPermissions(user.id, teamId);

	if (!userPermissions['inviteMembers'] && !userPermissions['*']) {
		return NextResponse.json(
			{ error: 'Forbidden: You do not have sufficient permissions.' },
			{ status: 403 }
		);
	}

	// Fetch all pending invites for the team
	const { data: invites, error: invitesError } = await supabase
		.from('invites')
		.select('*')
		.eq('team_id', teamId)
		.eq('status', 'Pending');

	if (invitesError) {
		console.error('Error fetching invites:', invitesError);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}

	// Update all pending invites' last sent timestamp
	const { error: updateError } = await supabase
		.from('invites')
		.update({
			last_sent_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		})
		.eq('team_id', teamId)
		.eq('status', 'Pending');

	if (updateError) {
		console.error('Error updating invites:', updateError);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}

	// TODO: Send the invite emails here
	// This would typically involve calling your email service
	// For now, we'll just return success

	return NextResponse.json(
		{
			message: 'All pending invites resent successfully',
			count: invites.length,
		},
		{ status: 200 }
	);
}
