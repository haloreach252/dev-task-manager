// src/app/api/boards/[boardId]/columns/[columnId]/reorder/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
	req: Request,
	props: { params: Promise<{ boardId: string; columnId: string }> }
) {
	const params = await props.params;
	const { columnId } = params;
	const { targetColumnId } = await req.json();

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
