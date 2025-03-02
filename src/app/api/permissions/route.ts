import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { getUserPermissions } from '@/lib/permissions';

export async function POST(req: Request) {
	const supabase = await createClient();

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { teamId, teamIds } = await req.json();

	if (!teamId && (!Array.isArray(teamIds) || teamIds.length === 0)) {
		return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
	}

	const dbUser = await prisma.user.findUnique({
		where: { id: user.id },
		select: { isAdmin: true },
	});

	if (!dbUser)
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

	let permissionsMap: Record<string, any> = {};
	if (dbUser.isAdmin) {
		if (teamId) {
			permissionsMap[teamId] = { '*': true };
		} else {
			permissionsMap = Object.fromEntries(
				teamIds.map((id) => [id, { '*': true }])
			);
		}
	} else {
		if (teamId) {
			permissionsMap[teamId] = await getUserPermissions(user.id, teamId);
		} else {
			// Fetch permissions for all requested teams
			for (const teamId of teamIds) {
				permissionsMap[teamId] = await getUserPermissions(
					user.id,
					teamId
				);
			}
		}
	}

	return NextResponse.json({ permissions: permissionsMap });
}
