import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
	req: Request,
	{ params }: { params: { boardId: string; taskId: string } }
) {
	const { taskId } = await params;
	const { targetId, targetColumnId } = await req.json();

	try {
		// Find the dragged task
		const draggedTask = await prisma.task.findUnique({
			where: { id: taskId },
		});

		if (!draggedTask) {
			console.error('DRAGGED TASK NOT FOUND');
			return NextResponse.json(
				{ error: 'Dragged task not found' },
				{ status: 404 }
			);
		}

		// If there's a target task (i.e., task is being dropped near another)
		let newOrder: number;
		if (targetId) {
			const targetTask = await prisma.task.findUnique({
				where: { id: targetId },
			});

			if (!targetTask) {
				console.error('TARGET TASK NOT FOUND');
				return NextResponse.json(
					{ error: 'Target task not found' },
					{ status: 404 }
				);
			}

			newOrder = targetTask.order + 1; // Place it after the target task
		} else {
			// If dropped into an empty column or at the end
			const maxOrderTask = await prisma.task.findFirst({
				where: { columnId: targetColumnId },
				orderBy: { order: 'desc' },
			});

			newOrder = maxOrderTask ? maxOrderTask.order + 1 : 0;
		}

		// Update the dragged task with the new column and order
		const updatedTask = await prisma.task.update({
			where: { id: taskId },
			data: {
				columnId: targetColumnId,
				order: newOrder,
			},
		});

		return NextResponse.json(updatedTask);
	} catch (error) {
		console.error('Task Reorder Error:', error);
		return NextResponse.json(
			{ error: 'Failed to reorder task' },
			{ status: 500 }
		);
	}
}
