// src/app/api/boards/[boardId]/tasks/[taskId]/route.ts

import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { getUserPermissions } from '@/lib/permissions';
import { validateReorderTask } from '../types';
import {
	createErrorResponse,
	createSuccessResponse,
} from '@/app/api/shared/utils';
import { rateLimit } from '@/lib/rate-limit';

export async function PUT(
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
	const rateLimitResult = await rateLimit(user.id, 'reorderTask', 50, 3600); // 50 reorders per hour
	if (!rateLimitResult.success) {
		return createErrorResponse(
			{
				code: 'RATE_LIMIT_EXCEEDED',
				message: 'Too many reorder requests',
			},
			429
		);
	}

	try {
		const body = await request.json();
		const validationResult = validateReorderTask(body);
		if ('error' in validationResult) {
			return validationResult;
		}

		const { targetId, targetColumnId } = body;

		// Find the dragged task
		const draggedTask = await prisma.task.findUnique({
			where: { id: taskId },
		});

		if (!draggedTask) {
			return createErrorResponse(
				{ code: 'NOT_FOUND', message: 'Task not found' },
				404
			);
		}

		// If there's a target task (i.e., task is being dropped near another)
		let newOrder: number;
		if (targetId) {
			const targetTask = await prisma.task.findUnique({
				where: { id: targetId },
			});

			if (!targetTask) {
				return createErrorResponse(
					{ code: 'NOT_FOUND', message: 'Target task not found' },
					404
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

		return createSuccessResponse({ task: updatedTask });
	} catch (error) {
		console.error('Task Reorder Error:', error);
		return createErrorResponse(
			{ code: 'INTERNAL_ERROR', message: 'Failed to reorder task' },
			500
		);
	}
}
