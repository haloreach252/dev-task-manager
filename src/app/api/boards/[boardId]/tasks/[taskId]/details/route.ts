// src/app/api/boards/[boardId]/tasks/[taskId]/details/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserPermissions } from '@/lib/permissions';
import { createClient } from '@/lib/supabase';
import { BoardVisibility } from '@prisma/client';

export async function GET(
	request: Request,
	props: { params: Promise<{ boardId: string; taskId: string }> }
) {
	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();
	const { taskId, boardId } = await props.params;

	// Check permissions
	const board = await prisma.board.findUnique({
		where: { id: boardId },
	});

	if (!board) {
		return NextResponse.json({ error: "Board not found" }, { status: 404 });
	}

	if (!(board.visibility === BoardVisibility.PUBLIC)) {
		if (!user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 403 }
			);
		}

		const project = await prisma.project.findUnique({
			where: { id: board.projectId },
		});

		if (!project) {
			return NextResponse.json({ error: "Project not found" }, { status: 404 });
		}

		const teamId = project.teamId;
		const userPermissions = await getUserPermissions(user.id, teamId);

		if (!userPermissions['viewTasks'])
	}

	// Task detail get logic
	try {
		const task = await prisma.task.findUnique({
			where: { id: taskId },
			include: {
				// Include nested checklists and their items
				checklists: {
					include: {
						items: true,
					},
				},
				// Include attachments
				attachments: true,
				// Since labels are stored via a join table (TaskLabel)
				// include the label data
				labels: {
					include: {
						label: true,
					},
				},
			},
		});

		if (!task) {
			return NextResponse.json(
				{ error: 'Task not found' },
				{ status: 404 }
			);
		}

		// Transform TaskLabel join objects into an array of label objects
		const transformedTask = {
			...task,
			labels: task.labels.map((tl) => tl.label),
		};

		return NextResponse.json(transformedTask);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: 'Error fetching task details' },
			{ status: 500 }
		);
	}
}

export async function PATCH(
	request: Request,
	props: { params: Promise<{ boardId: string; taskId: string }> }
) {
	const { taskId } = await props.params;

	try {
		const body = await request.json();
		// Expecting the payload to include:
		// title, description, dueDate, checklists, attachments, labels.
		const { title, description, dueDate, checklists, attachments, labels } =
			body;

		const updatedTask = await prisma.$transaction(async (tx) => {
			// Update main task fields.
			await tx.task.update({
				where: { id: taskId },
				data: {
					title,
					description,
					dueDate: dueDate ? new Date(dueDate) : null,
				},
			});

			// --- Update Checklists ---
			// Remove all existing checklists for the task.
			await tx.checklist.deleteMany({
				where: { taskId: taskId },
			});
			// Create new checklists along with their checklist items.
			if (checklists && Array.isArray(checklists)) {
				for (const cl of checklists) {
					// Each checklist should have a name and an items array.
					await tx.checklist.create({
						data: {
							name: cl.name,
							task: { connect: { id: taskId } },
							items: {
								create: cl.items.map((item: any) => ({
									text: item.text,
									completed: item.completed,
								})),
							},
						},
					});
				}
			}

			// --- Update Attachments ---
			// Remove all existing attachments.
			await tx.fileAttachment.deleteMany({
				where: { taskId: taskId },
			});
			// Create new attachment records.
			if (attachments && Array.isArray(attachments)) {
				for (const att of attachments) {
					await tx.fileAttachment.create({
						data: {
							fileUrl: att.fileUrl,
							fileName: att.fileName,
							fileType: att.fileType,
							fileSize: att.fileSize,
							task: { connect: { id: taskId } },
						},
					});
				}
			}

			// --- Update Labels ---
			// Remove existing TaskLabel join records.
			await tx.taskLabel.deleteMany({
				where: { taskId: taskId },
			});
			// Create new join records linking the task to labels.
			if (labels && Array.isArray(labels)) {
				for (const lbl of labels) {
					await tx.taskLabel.create({
						data: {
							task: { connect: { id: taskId } },
							label: { connect: { id: lbl.id } },
						},
					});
				}
			}

			// Return the updated task details.
			const fullTask = await tx.task.findUnique({
				where: { id: taskId },
				include: {
					checklists: {
						include: { items: true },
					},
					attachments: true,
					labels: { include: { label: true } },
				},
			});
			return fullTask;
		});

		// Transform TaskLabel join objects into an array of Label objects.
		const transformedTask = {
			...updatedTask,
			labels: updatedTask?.labels.map((tl) => tl.label),
		};
		return NextResponse.json(transformedTask);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: 'Error updating task details' },
			{ status: 500 }
		);
	}
}
