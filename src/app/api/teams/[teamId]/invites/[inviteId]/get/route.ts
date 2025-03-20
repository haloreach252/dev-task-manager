import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase-db';
import { getUserPermissions } from '@/lib/permissions';
import type { Database } from '@/lib/supabase-db';

type Invite = Database['public']['Tables']['invites']['Row'];
type TeamRole = Database['public']['Tables']['team_roles']['Row'];

export async function GET(
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

	// Check if user has permission to view invites
	const userPermissions = await getUserPermissions(user.id, teamId);

	if (!userPermissions['inviteMembers'] && !userPermissions['*']) {
		return NextResponse.json(
			{ error: 'Forbidden: You do not have sufficient permissions.' },
			{ status: 403 }
		);
	}

	// Fetch the invite with its associated role
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
		.eq('id', inviteId)
		.eq('team_id', teamId)
		.single();

	if (inviteError || !invite) {
		return NextResponse.json({ error: 'Invalid invite' }, { status: 400 });
	}

	return NextResponse.json({ invite }, { status: 200 });
}
