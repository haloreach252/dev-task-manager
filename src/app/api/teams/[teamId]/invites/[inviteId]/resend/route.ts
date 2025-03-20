import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase-db';
import { getUserPermissions } from '@/lib/permissions';
import type { Database } from '@/lib/supabase-db';

type Invite = Database['public']['Tables']['invites']['Row'];

export async function POST(
	request: Request,
	props: { params: Promise<{ teamId: string; inviteId: string }> }
) {
	const { teamId, inviteId } = await props.params;
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
			{ error: 'Cannot resend a non-pending invite' },
			{ status: 400 }
		);
	}

	// Update the invite's last sent timestamp
	const { error: updateError } = await supabase
		.from('invites')
		.update({
			last_sent_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		})
		.eq('id', invite.id);

	if (updateError) {
		console.error('Error updating invite:', updateError);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}

	// TODO: Send the invite email here
	// This would typically involve calling your email service
	// For now, we'll just return success

	return NextResponse.json(
		{ message: 'Invite resent successfully' },
		{ status: 200 }
	);
}
