// src/app/api/boards/[boardId]/tasks/[taskid]/labels/route.ts

import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { getUserPermissions } from '@/lib/permissions';
import { validateManageTaskLabels } from '../../types';
import {
	createErrorResponse,
	createSuccessResponse,
} from '@/app/api/shared/utils';
import { rateLimit } from '@/lib/rate-limit';

// Add or remove a label from a task
export async function POST(
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
	const rateLimitResult = await rateLimit(
		user.id,
		'manageTaskLabels',
		30,
		3600
	); // 30 label operations per hour
	if (!rateLimitResult.success) {
		return createErrorResponse(
			{
				code: 'RATE_LIMIT_EXCEEDED',
				message: 'Too many label operations',
			},
			429
		);
	}

	try {
		const body = await request.json();
		const validationResult = validateManageTaskLabels(body);
		if ('error' in validationResult) {
			return validationResult;
		}

		const { labelId, action } = body;

		// Check if the task exists
		const task = await prisma.task.findUnique({
			where: { id: taskId },
		});

		if (!task) {
			return createErrorResponse(
				{ code: 'NOT_FOUND', message: 'Task not found' },
				404
			);
		}

		// Check if the label exists and belongs to the board
		const label = await prisma.label.findUnique({
			where: { id: labelId },
		});

		if (!label) {
			return createErrorResponse(
				{ code: 'NOT_FOUND', message: 'Label not found' },
				404
			);
		}

		if (label.boardId !== boardId) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'Label does not belong to this board',
				},
				403
			);
		}

		if (action === 'add') {
			// Check if the label is already attached to the task
			const existingLabel = await prisma.taskLabel.findUnique({
				where: {
					taskId_labelId: {
						taskId,
						labelId,
					},
				},
			});

			if (existingLabel) {
				return createErrorResponse(
					{
						code: 'CONFLICT',
						message: 'Label is already attached to this task',
					},
					409
				);
			}

			await prisma.taskLabel.create({
				data: { taskId, labelId },
			});
		} else if (action === 'remove') {
			await prisma.taskLabel.deleteMany({
				where: { taskId, labelId },
			});
		}

		// Return the updated task labels
		const updatedTask = await prisma.task.findUnique({
			where: { id: taskId },
			include: { labels: { include: { label: true } } },
		});

		if (!updatedTask) {
			return createErrorResponse(
				{ code: 'NOT_FOUND', message: 'Task not found' },
				404
			);
		}

		return createSuccessResponse({
			task: {
				...updatedTask,
				labels: updatedTask.labels.map((tl) => tl.label),
			},
		});
	} catch (error) {
		console.error('Error managing task labels:', error);
		return createErrorResponse(
			{ code: 'INTERNAL_ERROR', message: 'Failed to manage task labels' },
			500
		);
	}
}
