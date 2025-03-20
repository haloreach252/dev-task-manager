import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase-db';
import { getUserPermissions } from '@/lib/permissions';
import type { Database } from '@/lib/supabase-db';

type Invite = Database['public']['Tables']['invites']['Row'];

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

	if (error || !user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Check if user has permission to view invite stats
	const userPermissions = await getUserPermissions(user.id, teamId);

	if (!userPermissions['inviteMembers'] && !userPermissions['*']) {
		return NextResponse.json(
			{ error: 'Forbidden: You do not have sufficient permissions.' },
			{ status: 403 }
		);
	}

	// Fetch all invites for the team
	const { data: invites, error: invitesError } = await supabase
		.from('invites')
		.select('*')
		.eq('team_id', teamId);

	if (invitesError) {
		console.error('Error fetching invites:', invitesError);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}

	// Calculate statistics
	const stats = {
		total: invites.length,
		pending: invites.filter((invite) => invite.status === 'Pending').length,
		accepted: invites.filter((invite) => invite.status === 'Accepted')
			.length,
		rejected: invites.filter((invite) => invite.status === 'Rejected')
			.length,
		expired: invites.filter((invite) => invite.status === 'Expired').length,
		revoked: invites.filter((invite) => invite.status === 'Revoked').length,
		lastSent: invites.reduce((latest, invite) => {
			if (!invite.last_sent_at) return latest;
			if (!latest) return invite.last_sent_at;
			return new Date(invite.last_sent_at) > new Date(latest)
				? invite.last_sent_at
				: latest;
		}, null as string | null),
	};

	return NextResponse.json({ stats }, { status: 200 });
}
