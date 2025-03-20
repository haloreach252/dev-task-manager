import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase-db';
import type { Database } from '@/lib/supabase-db';

type Invite = Database['public']['Tables']['invites']['Row'];

export async function POST(request: Request) {
	const { token } = await request.json();
	const supabaseAuth = await createClient();

	const {
		data: { user },
		error,
	} = await supabaseAuth.auth.getUser();

	if (error || !user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Fetch the invite
	const { data: invite, error: inviteError } = await supabase
		.from('invites')
		.select('*')
		.eq('token', token)
		.single();

	if (inviteError || !invite) {
		return NextResponse.json({ error: 'Invalid invite' }, { status: 400 });
	}

	// Check if invite is expired
	if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
		return NextResponse.json(
			{ error: 'Invite has expired' },
			{ status: 400 }
		);
	}

	// Ensure invite matches the authenticated user's email
	if (invite.email !== user.email) {
		return NextResponse.json(
			{ error: 'Invite does not match your email' },
			{ status: 403 }
		);
	}

	// Update the invite status to rejected
	const { error: updateError } = await supabase
		.from('invites')
		.update({
			status: 'Rejected',
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

	return NextResponse.json({ message: 'Invite Rejected' }, { status: 200 });
}
