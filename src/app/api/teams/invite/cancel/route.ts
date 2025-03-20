import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase-db';
import { getUserPermissions } from '@/lib/permissions';
import type { Database } from '@/lib/supabase-db';

type Invite = Database['public']['Tables']['invites']['Row'];

export async function POST(request: Request) {
	const { inviteId, teamId } = await request.json();
	const supabaseAuth = await createClient();

	const {
		data: { user },
		error,
	} = await supabaseAuth.auth.getUser();

	if (error || !user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Check if user has permission to cancel invites
	const userPermissions = await getUserPermissions(user.id, teamId);

	if (!userPermissions['inviteMembers'] && !userPermissions['*']) {
		return NextResponse.json(
			{ error: 'Forbidden: You do not have sufficient permissions.' },
			{ status: 403 }
		);
	}

	// Fetch the invite
	const { data: invite, error: inviteError } = await supabase
		.from('invites')
		.select('*')
		.eq('id', inviteId)
		.eq('team_id', teamId)
		.single();

	if (inviteError || !invite) {
		return NextResponse.json({ error: 'Invalid invite' }, { status: 400 });
	}

	// Check if invite is already accepted or rejected
	if (invite.status !== 'Pending') {
		return NextResponse.json(
			{ error: 'Cannot cancel a non-pending invite' },
			{ status: 400 }
		);
	}

	// Update the invite status to canceled
	const { error: updateError } = await supabase
		.from('invites')
		.update({
			status: 'Canceled',
			updated_at: new Date().toISOString(),
		})
		.eq('id', invite.id);

	if (updateError) {
		console.error('Error updating invite status:', updateError);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}

	return NextResponse.json({ message: 'Invite Canceled' }, { status: 200 });
}
