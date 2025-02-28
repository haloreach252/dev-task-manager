import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase';

export async function GET(
	request: Request,
	props: { params: Promise<{ teamId: string }> }
) {
	try {
		const { teamId } = await props.params;
		const supabase = await createClient();
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();

		if (error || !user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		// Check if user is a member of the team
		const teamMember = await prisma.teamMember.findFirst({
			where: { teamId, userId: user.id },
			include: { teamRole: true },
		});

		if (!teamMember) {
			return NextResponse.json(
				{ error: 'Forbidden: You are not a member of this team' },
				{ status: 403 }
			);
		}

		// Parse permissions
		let permissions: string[] = [];
		const role = teamMember.teamRole;
		const rolePermissions = role?.permissions
			? JSON.parse(role.permissions)
			: {};

		if (role.name === 'Admin') {
			permissions = ['*'];
		} else {
			permissions = Object.keys(rolePermissions).filter(
				(key) => rolePermissions[key] === true
			);
		}

		// Enforce RBAC: Only allow users with 'viewProjects' permission
		if (
			!permissions.includes('*') &&
			!permissions.includes('viewProjects')
		) {
			return NextResponse.json(
				{ error: 'Forbidden: You do not have access to view projects' },
				{ status: 403 }
			);
		}

		// Fetch projects for the team
		const projects = await prisma.project.findMany({
			where: { teamId },
		});

		return NextResponse.json({ projects });
	} catch (error) {
		console.error('Error fetching projects:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
