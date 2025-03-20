import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase-db';
import { getUserPermissions } from '@/lib/permissions';
import type { Database } from '@/lib/supabase-db';

type Invite = Database['public']['Tables']['invites']['Row'];
type TeamRole = Database['public']['Tables']['team_roles']['Row'];

export async function GET(
	request: Request,
	props: { params: Promise<{ teamId: string }> }
) {
	const { teamId } = await props.params;
	const { searchParams } = new URL(request.url);
	const status = searchParams.get('status');

	const supabaseAuth = await createClient();

	const {
		data: { user },
		error,
	} = await supabaseAuth.auth.getUser();

	if (error || !user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Check if user has permission to export invites
	const userPermissions = await getUserPermissions(user.id, teamId);

	if (!userPermissions['inviteMembers'] && !userPermissions['*']) {
		return NextResponse.json(
			{ error: 'Forbidden: You do not have sufficient permissions.' },
			{ status: 403 }
		);
	}

	// Build the query
	let queryBuilder = supabase
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
		.eq('team_id', teamId);

	// Add status filter if provided
	if (status) {
		queryBuilder = queryBuilder.eq('status', status);
	}

	// Execute the query
	const { data: invites, error: invitesError } = await queryBuilder;

	if (invitesError) {
		console.error('Error fetching invites:', invitesError);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}

	// Format the data for CSV
	const csvRows = [
		// Header row
		[
			'Email',
			'Role',
			'Status',
			'Created At',
			'Last Sent At',
			'Expires At',
		].join(','),
		// Data rows
		...invites.map((invite) =>
			[
				invite.email,
				invite.team_roles?.name || 'Unknown',
				invite.status,
				invite.created_at,
				invite.last_sent_at || '',
				invite.expires_at || '',
			].join(',')
		),
	].join('\n');

	// Set response headers for CSV download
	const headers = new Headers();
	headers.set('Content-Type', 'text/csv');
	headers.set(
		'Content-Disposition',
		`attachment; filename="team-invites-${teamId}.csv"`
	);

	return new NextResponse(csvRows, {
		status: 200,
		headers,
	});
}
