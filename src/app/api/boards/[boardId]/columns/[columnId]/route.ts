// src/app/api/boards/[boardId]/columns/[columnId]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase';
import { checkPermissions } from '@/lib/permissions';

export async function PUT(
	req: Request,
	props: { params: Promise<{ boardId: string; columnId: string }> }
) {
	const { boardId, columnId } = await props.params;

	const supabase = await createClient();
	const { data: { user }, error } = await supabase.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
	}

	const project = await prisma.project.findFirst({
		where: { boards: { some: { id: boardId }}}
	})

	if (!project) {
		return NextResponse.json({ error: "Project not found" }, { status: 404})
	}

	const hasPermission = await checkPermissions(user.id, project.teamId, ['editColumns']);

	if (!hasPermission) {
		return NextResponse.json({ error: "Forbidden: You do not have permission to edit columns" }, { status: 403 });
	}

	try {
		
		const { backgroundColor } = await req.json();

		// Optionally validate that a backgroundColor is provided
		if (!backgroundColor) {
			return NextResponse.json(
				{ error: 'backgroundColor is required' },
				{ status: 400 }
			);
		}

		const updatedColumn = await prisma.column.update({
			where: { id: columnId },
			data: { backgroundColor },
		});

		return NextResponse.json(updatedColumn);
	} catch (error) {
		console.error('Error updating column backgroundColor:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
