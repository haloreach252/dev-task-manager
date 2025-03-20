// src/app/api/boards/[boardId]/tasks/route.ts

import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { getUserPermissions } from '@/lib/permissions';
import { validateCreateTask } from './types';
import {
	createErrorResponse,
	createSuccessResponse,
} from '@/app/api/shared/utils';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(
	request: Request,
	props: { params: Promise<{ boardId: string }> }
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

	const { boardId } = await props.params;

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

	if (!userPermissions['createTasks'] && !userPermissions['*']) {
		return createErrorResponse(
			{
				code: 'FORBIDDEN',
				message: 'You do not have permission to create tasks',
			},
			403
		);
	}

	// Rate limiting
	const rateLimitResult = await rateLimit(user.id, 'createTask', 20, 3600); // 20 tasks per hour
	if (!rateLimitResult.success) {
		return createErrorResponse(
			{
				code: 'RATE_LIMIT_EXCEEDED',
				message: 'Too many task creation requests',
			},
			429
		);
	}

	try {
		const body = await request.json();
		const validationResult = validateCreateTask(body);
		if ('error' in validationResult) {
			return validationResult;
		}

		const {
			title,
			columnId,
			description,
			dueDate,
			checklists,
			attachments,
			labels,
		} = body;

		// Check if the column exists and belongs to the board
		const column = await prisma.column.findUnique({
			where: { id: columnId },
		});

		if (!column) {
			return createErrorResponse(
				{ code: 'NOT_FOUND', message: 'Column not found' },
				404
			);
		}

		if (column.boardId !== boardId) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'Column does not belong to this board',
				},
				403
			);
		}

		// Get the maximum order in the column
		const maxOrderTask = await prisma.task.findFirst({
			where: { columnId },
			orderBy: { order: 'desc' },
		});

		const newOrder = maxOrderTask ? maxOrderTask.order + 1 : 0;

		// Create the task with all its related data
		const task = await prisma.$transaction(async (tx) => {
			// Create the main task
			const newTask = await tx.task.create({
				data: {
					title,
					description,
					dueDate: dueDate ? new Date(dueDate) : null,
					columnId,
					order: newOrder,
				},
			});

			// Create checklists if provided
			if (checklists && Array.isArray(checklists)) {
				for (const cl of checklists) {
					await tx.checklist.create({
						data: {
							name: cl.name,
							task: { connect: { id: newTask.id } },
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

			// Create attachments if provided
			if (attachments && Array.isArray(attachments)) {
				for (const att of attachments) {
					await tx.fileAttachment.create({
						data: {
							fileUrl: att.fileUrl,
							fileName: att.fileName,
							fileType: att.fileType,
							fileSize: att.fileSize,
							task: { connect: { id: newTask.id } },
						},
					});
				}
			}

			// Create label associations if provided
			if (labels && Array.isArray(labels)) {
				for (const lbl of labels) {
					await tx.taskLabel.create({
						data: {
							task: { connect: { id: newTask.id } },
							label: { connect: { id: lbl.id } },
						},
					});
				}
			}

			// Return the created task with all its relations
			return await tx.task.findUnique({
				where: { id: newTask.id },
				include: {
					checklists: {
						include: { items: true },
					},
					attachments: true,
					labels: { include: { label: true } },
				},
			});
		});

		if (!task) {
			return createErrorResponse(
				{ code: 'INTERNAL_ERROR', message: 'Failed to create task' },
				500
			);
		}

		// Transform TaskLabel join objects into an array of Label objects
		const transformedTask = {
			...task,
			labels: task.labels.map((tl) => tl.label),
		};

		return createSuccessResponse({ task: transformedTask });
	} catch (error) {
		console.error('Error creating task:', error);
		return createErrorResponse(
			{ code: 'INTERNAL_ERROR', message: 'Failed to create task' },
			500
		);
	}
}
