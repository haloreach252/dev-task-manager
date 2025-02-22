import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
	req: Request,
	props: { params: Promise<{ boardId: string; taskId: string }> }
) {
	const { taskId } = await props.params;

	try {
		// Expecting the following in the request body:
		// - title: string
		// - description: string
		// - dueDate: string (ISO data format) or empty
		// - checklistItems: Array<{ text: string, completed: boolean }>
		const { title, description, dueDate, checklistItems } =
			await req.json();

		// Update the task fields: title, description, and dueDate
		await prisma.task.update({
			where: { id: taskId },
			data: {
				title,
				description,
				dueDate: dueDate ? new Date(dueDate) : null,
			},
		});

		// Remove existing checklist items for the task
		await prisma.checklistItem.deleteMany({
			where: { taskId },
		});

		// Recreate checklist items based on the new data
		if (Array.isArray(checklistItems)) {
			for (const item of checklistItems) {
				await prisma.checklistItem.create({
					data: {
						text: item.text,
						completed: item.completed,
						taskId,
					},
				});
			}
		}

		// Return the updated task along with its checklist items
		const taskWithChecklist = await prisma.task.findUnique({
			where: { id: taskId },
			include: { checklistItems: true },
		});

		return NextResponse.json(taskWithChecklist);
	} catch (error) {
		console.error('Task details update error: ', error);
		return NextResponse.json(
			{
				error: 'Failed to update task details',
			},
			{ status: 500 }
		);
	}
}
