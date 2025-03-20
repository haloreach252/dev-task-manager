import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase-db';
import type { Database } from '@/lib/supabase-db';

type Invite = Database['public']['Tables']['invites']['Row'];
type TeamRole = Database['public']['Tables']['team_roles']['Row'];

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const token = searchParams.get('token');

	if (!token) {
		return NextResponse.json(
			{ error: 'Token is required' },
			{ status: 400 }
		);
	}

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
		.select(
			`
			*,
			team_roles (
				id,
				name,
				permissions
			)
		`
		)
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

	// Check if the user is already a member of the team
	const { data: existingMember, error: memberError } = await supabase
		.from('team_members')
		.select('*')
		.eq('team_id', invite.team_id)
		.eq('user_id', user.id)
		.single();

	if (memberError && memberError.code !== 'PGRST116') {
		// PGRST116 is "no rows returned"
		console.error('Error checking existing member:', memberError);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}

	if (existingMember) {
		return NextResponse.json(
			{ error: 'You are already a member of this team' },
			{ status: 400 }
		);
	}

	// Check if invite is already accepted or rejected
	if (invite.status !== 'Pending') {
		return NextResponse.json(
			{ error: 'Invite is no longer valid' },
			{ status: 400 }
		);
	}

	return NextResponse.json(
		{
			invite,
			message: 'Invite is valid',
		},
		{ status: 200 }
	);
}
