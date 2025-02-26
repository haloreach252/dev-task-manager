// src/app/api/boards/[boardId]/tasks/[taskid]/labels/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Add or remove a label from a task
export async function POST(
    request: Request,
    props: { params: Promise<{ boardId: string; taskId: string }>}
) {
    const { taskId } = await props.params;
    const { labelId, action } = await request.json();

    try {
        if (action === 'add') {
            await prisma.taskLabel.create({
                data: { taskId, labelId }
            });
        } else if (action === 'remove') {
            await prisma.taskLabel.deleteMany({
                where: { taskId, labelId }
            });
        } else {
            return NextResponse.json({ error: 'Invalid Action' }, { status: 400 })
        }

        // Return the updated task labels
        const updatedTask = await prisma.task.findUnique({
            where: { id: taskId },
            include: { labels: { include: { label: true }}}
        });

        return NextResponse.json({
			...updatedTask,
			labels: updatedTask?.labels.map((tl) => tl.label),
		});
    } catch (error) {
		console.error('Error updating task labels:', error);
		return NextResponse.json({ error: 'Failed to update labels' }, { status: 500 });
	}
}