// src/app/api/boards/[boardId]/columns/[columnId]/reorder/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkPermissions } from '@/lib/permissions';
import { createClient } from '@/lib/supabase';

export async function PUT(
	req: Request,
	props: { params: Promise<{ boardId: string; columnId: string }> }
) {
	const params = await props.params;
	const { boardId, columnId } = params;
	const { targetColumnId } = await req.json();

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
		// Fetch both the dragged and target columns
		const [draggedColumn, targetColumn] = await Promise.all([
			prisma.column.findUnique({ where: { id: columnId } }),
			prisma.column.findUnique({ where: { id: targetColumnId } }),
		]);

		// Validate existence
		if (!draggedColumn || !targetColumn) {
			return NextResponse.json(
				{ error: 'One or both columns not found.' },
				{ status: 404 }
			);
		}

		// Swap orders between dragged and target columns
		await prisma.$transaction([
			prisma.column.update({
				where: { id: draggedColumn.id },
				data: { order: targetColumn.order },
			}),
			prisma.column.update({
				where: { id: targetColumn.id },
				data: { order: draggedColumn.order },
			}),
		]);

		return NextResponse.json({
			message: 'Columns reordered successfully.',
		});
	} catch (error) {
		console.error('Column Reorder Error:', error);
		return NextResponse.json(
			{ error: 'Failed to reorder columns.' },
			{ status: 500 }
		);
	}
}
