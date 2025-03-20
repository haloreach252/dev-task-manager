import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase-db';
import { getUserPermissions } from '@/lib/permissions';
import type { Database } from '@/lib/supabase-db';

type Invite = Database['public']['Tables']['invites']['Row'];
type TeamRole = Database['public']['Tables']['team_roles']['Row'];

export async function PATCH(
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

	// Check if user has permission to update invites
	const userPermissions = await getUserPermissions(user.id, teamId);

	if (!userPermissions['inviteMembers'] && !userPermissions['*']) {
		return NextResponse.json(
			{ error: 'Forbidden: You do not have sufficient permissions.' },
			{ status: 403 }
		);
	}

	// Get the update data from the request
	const { roleId, expiresAt } = await request.json();

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
			{ error: 'Cannot update a non-pending invite' },
			{ status: 400 }
		);
	}

	// If roleId is provided, verify it exists
	if (roleId) {
		const { data: role, error: roleError } = await supabase
			.from('team_roles')
			.select('*')
			.eq('id', roleId)
			.eq('team_id', teamId)
			.single();

		if (roleError || !role) {
			return NextResponse.json(
				{ error: 'Invalid role' },
				{ status: 400 }
			);
		}
	}

	// Update the invite
	const { error: updateError } = await supabase
		.from('invites')
		.update({
			...(roleId && { role: roleId }),
			...(expiresAt && { expires_at: expiresAt }),
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

	return NextResponse.json(
		{ message: 'Invite updated successfully' },
		{ status: 200 }
	);
}
