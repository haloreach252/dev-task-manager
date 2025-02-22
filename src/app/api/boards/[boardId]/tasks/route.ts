import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
	req: Request,
	props: { params: Promise<{ boardId: string }> }
) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { boardId } = await props.params;
	const { title, columnId } = await req.json();

	try {
		// Find existing tasks in the column for ordering
		const existingTasks = await prisma.task.findMany({
			where: { columnId },
		});

		const order = existingTasks.length;

		const newTask = await prisma.task.create({
			data: {
				title,
				order,
				columnId,
			},
		});

		return NextResponse.json(newTask);
	} catch (error) {
		console.error('POST Task Error:', error);
		return NextResponse.json(
			{ error: 'Failed to create task' },
			{ status: 500 }
		);
	}
}
