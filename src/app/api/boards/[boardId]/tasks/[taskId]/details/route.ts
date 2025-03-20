// src/app/api/boards/[boardId]/tasks/[taskId]/details/route.ts

import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { getUserPermissions } from '@/lib/permissions';
import { BoardVisibility } from '@prisma/client';
import { validateUpdateTask } from '../../types';
import {
	createErrorResponse,
	createSuccessResponse,
} from '@/app/api/shared/utils';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(
	request: Request,
	props: { params: Promise<{ boardId: string; taskId: string }> }
) {
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return createErrorResponse(
			{ code: 'UNAUTHORIZED', message: 'Unauthorized' },
			401
		);
	}

	const { taskId, boardId } = await props.params;

	// Check permissions
	const board = await prisma.board.findUnique({
		where: { id: boardId },
		include: { project: true },
	});

	if (!board) {
		return createErrorResponse(
			{ code: 'NOT_FOUND', message: 'Board not found' },
			404
		);
	}

	if (!(board.visibility === BoardVisibility.PUBLIC)) {
		const teamId = board.project.teamId;
		const userPermissions = await getUserPermissions(user.id, teamId);

		if (!userPermissions['viewTasks'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'You do not have permission to view tasks',
				},
				403
			);
		}
	}

	try {
		const task = await prisma.task.findUnique({
			where: { id: taskId },
			include: {
				checklists: {
					include: {
						items: true,
					},
				},
				attachments: true,
				labels: {
					include: {
						label: true,
					},
				},
			},
		});

		if (!task) {
			return createErrorResponse(
				{ code: 'NOT_FOUND', message: 'Task not found' },
				404
			);
		}

		// Transform TaskLabel join objects into an array of label objects
		const transformedTask = {
			...task,
			labels: task.labels.map((tl) => tl.label),
		};

		return createSuccessResponse({ task: transformedTask });
	} catch (error) {
		console.error('Error fetching task details:', error);
		return createErrorResponse(
			{ code: 'INTERNAL_ERROR', message: 'Error fetching task details' },
			500
		);
	}
}

export async function PATCH(
	request: Request,
	props: { params: Promise<{ boardId: string; taskId: string }> }
) {
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return createErrorResponse(
			{ code: 'UNAUTHORIZED', message: 'Unauthorized' },
			401
		);
	}

	const { taskId, boardId } = await props.params;

	// Check permissions
	const board = await prisma.board.findUnique({
		where: { id: boardId },
		include: { project: true },
	});

	if (!board) {
		return createErrorResponse(
			{ code: 'NOT_FOUND', message: 'Board not found' },
			404
		);
	}

	const teamId = board.project.teamId;
	const userPermissions = await getUserPermissions(user.id, teamId);

	if (!userPermissions['editTasks'] && !userPermissions['*']) {
		return createErrorResponse(
			{
				code: 'FORBIDDEN',
				message: 'You do not have permission to edit tasks',
			},
			403
		);
	}

	// Rate limiting
	const rateLimitResult = await rateLimit(user.id, 'updateTask', 20, 3600); // 20 updates per hour
	if (!rateLimitResult.success) {
		return createErrorResponse(
			{
				code: 'RATE_LIMIT_EXCEEDED',
				message: 'Too many update requests',
			},
			429
		);
	}

	try {
		const body = await request.json();
		const validationResult = validateUpdateTask(body);
		if ('error' in validationResult) {
			return validationResult;
		}

		const { title, description, dueDate, checklists, attachments, labels } =
			body;

		const updatedTask = await prisma.$transaction(async (tx) => {
			// Update main task fields
			await tx.task.update({
				where: { id: taskId },
				data: {
					title,
					description,
					dueDate: dueDate ? new Date(dueDate) : null,
				},
			});

			// Update Checklists
			await tx.checklist.deleteMany({
				where: { taskId: taskId },
			});

			if (checklists && Array.isArray(checklists)) {
				for (const cl of checklists) {
					await tx.checklist.create({
						data: {
							name: cl.name,
							task: { connect: { id: taskId } },
							items: {
								create: cl.items.map(
									(item: {
										text: string;
										completed: boolean;
									}) => ({
										text: item.text,
										completed: item.completed,
									})
								),
							},
						},
					});
				}
			}

			// Update Attachments
			await tx.fileAttachment.deleteMany({
				where: { taskId: taskId },
			});

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

			// Update Labels
			await tx.taskLabel.deleteMany({
				where: { taskId: taskId },
			});

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

			// Return the updated task details
			return await tx.task.findUnique({
				where: { id: taskId },
				include: {
					checklists: {
						include: { items: true },
					},
					attachments: true,
					labels: { include: { label: true } },
				},
			});
		});

		if (!updatedTask) {
			return createErrorResponse(
				{ code: 'NOT_FOUND', message: 'Task not found' },
				404
			);
		}

		// Transform TaskLabel join objects into an array of Label objects
		const transformedTask = {
			...updatedTask,
			labels: updatedTask.labels.map((tl) => tl.label),
		};

		return createSuccessResponse({ task: transformedTask });
	} catch (error) {
		console.error('Error updating task details:', error);
		return createErrorResponse(
			{ code: 'INTERNAL_ERROR', message: 'Error updating task details' },
			500
		);
	}
}
