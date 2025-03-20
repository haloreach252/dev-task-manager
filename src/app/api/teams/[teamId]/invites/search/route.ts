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
	const query = searchParams.get('q') || '';
	const status = searchParams.get('status');
	const page = parseInt(searchParams.get('page') || '1');
	const limit = parseInt(searchParams.get('limit') || '10');
	const offset = (page - 1) * limit;

	const supabaseAuth = await createClient();

	const {
		data: { user },
		error,
	} = await supabaseAuth.auth.getUser();

	if (error || !user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Check if user has permission to search invites
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
		`,
			{ count: 'exact' }
		)
		.eq('team_id', teamId);

	// Add search filter if query is provided
	if (query) {
		queryBuilder = queryBuilder.ilike('email', `%${query}%`);
	}

	// Add status filter if provided
	if (status) {
		queryBuilder = queryBuilder.eq('status', status);
	}

	// Add pagination
	queryBuilder = queryBuilder
		.order('created_at', { ascending: false })
		.range(offset, offset + limit - 1);

	// Execute the query
	const { data: invites, error: invitesError, count } = await queryBuilder;

	if (invitesError) {
		console.error('Error searching invites:', invitesError);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}

	return NextResponse.json(
		{
			invites,
			pagination: {
				total: count || 0,
				page,
				limit,
				pages: Math.ceil((count || 0) / limit),
			},
		},
		{ status: 200 }
	);
}
