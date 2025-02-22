import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
	req: Request,
	{ params }: { params: { boardId: string; taskId: string } }
) {
	const { taskId } = await params;
	const { targetId, targetColumnId } = await req.json();

	try {
		const targetTask = await prisma.task.findUnique({
			where: { id: targetId },
		});

		const updatedTask = await prisma.task.update({
			where: { id: taskId },
			data: {
				columnId: targetColumnId,
				order: targetTask?.order ?? 0,
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

export async function DELETE(
	req: Request,
	{ params }: { params: { taskId: string } }
) {
	const { taskId } = await params;

	try {
		await prisma.task.delete({ where: { id: taskId } });
		return NextResponse.json({ message: 'Task deleted' });
	} catch (error) {
		console.error('DELETE Task Error:', error);
		return NextResponse.json(
			{ error: 'Failed to delete task' },
			{ status: 500 }
		);
	}
}
