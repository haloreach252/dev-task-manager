// src/app/api/teams/[teamId]/invite/route.ts

import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase-db';
import { getUserPermissions } from '@/lib/permissions';
import type { Database } from '@/lib/supabase-db';

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

	if (!user || error) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
	}

	const userPermissions = await getUserPermissions(user.id, teamId);

	if (!userPermissions['inviteMembers'] && !userPermissions['*']) {
		return NextResponse.json(
			{ error: 'Forbidden: You do not have sufficient permissions.' },
			{ status: 403 }
		);
	}

	// TODO: Change this to use roleId instead of a set name
	//       so that the invite can be sent with a custom role
	let role: string | undefined;
	const { email, roleId } = await request.json();
	const token = nanoid(32);

	if (!roleId) {
		const { data: defaultRole, error: roleError } = await supabase
			.from('team_roles')
			.select('*')
			.eq('team_id', teamId)
			.eq('name', 'Viewer')
			.single();

		if (roleError) {
			console.error('Error fetching default role:', roleError);
			return NextResponse.json(
				{ error: 'Internal Server Error' },
				{ status: 500 }
			);
		}

		role = defaultRole?.id;
	} else {
		role = roleId;
	}

	const { error: inviteError } = await supabase.from('invites').insert({
		email,
		token,
		role: role || '',
		status: 'Pending',
		team_id: teamId,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	});

	if (inviteError) {
		console.error('Error creating invite:', inviteError);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}

	const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL}/invite/${token}`;

	return NextResponse.json({ inviteLink }, { status: 201 });
}
