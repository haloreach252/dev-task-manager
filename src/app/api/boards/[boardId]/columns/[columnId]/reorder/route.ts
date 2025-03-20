// src/app/api/boards/[boardId]/columns/[columnId]/reorder/route.ts

import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { getUserPermissions } from '@/lib/permissions';
import { validateReorderColumn } from '../../types';
import {
	createErrorResponse,
	createSuccessResponse,
} from '@/app/api/shared/utils';
import { rateLimit } from '@/lib/rate-limit';

export async function PUT(
	req: Request,
	props: { params: Promise<{ boardId: string; columnId: string }> }
) {
	try {
		const { boardId, columnId } = await props.params;
		const supabase = await createClient();
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();

		if (!user || error) {
			return createErrorResponse(
				{
					code: 'UNAUTHORIZED',
					message: 'Unauthorized',
				},
				401
			);
		}

		// Rate limiting
		const { success } = await rateLimit(user.id, 'reorderColumn', 50, 3600); // 50 reorders per hour
		if (!success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message: 'You can only reorder columns 50 times per hour',
				},
				429
			);
		}

		const board = await prisma.board.findUnique({
			where: { id: boardId },
			include: {
				project: true,
			},
		});

		if (!board) {
			return createErrorResponse(
				{
					code: 'NOT_FOUND',
					message: 'Board not found',
				},
				404
			);
		}

		const userPermissions = await getUserPermissions(
			user.id,
			board.project.teamId
		);
		if (!userPermissions['editColumns'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message:
						'You do not have permission to reorder columns in this board',
				},
				403
			);
		}

		const body = await req.json();

		// Validate input
		const validationError = validateReorderColumn(body);
		if (validationError) {
			return validationError;
		}

		const { targetColumnId } = body;

		// Fetch both the dragged and target columns
		const [draggedColumn, targetColumn] = await Promise.all([
			prisma.column.findUnique({ where: { id: columnId } }),
			prisma.column.findUnique({ where: { id: targetColumnId } }),
		]);

		// Validate existence
		if (!draggedColumn || !targetColumn) {
			return createErrorResponse(
				{
					code: 'NOT_FOUND',
					message: 'One or both columns not found',
				},
				404
			);
		}

		// Swap orders between dragged and target columns
		await prisma.$transaction([
			prisma.column.update({
				where: { id: draggedColumn.id },
				data: { order: targetColumn.order },
			}),
			prisma.column.update({
				where: { id: targetColumn.id },
				data: { order: draggedColumn.order },
			}),
		]);

		return createSuccessResponse({
			message: 'Columns reordered successfully',
		});
	} catch (error) {
		console.error('Column Reorder Error:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to reorder columns',
			},
			500
		);
	}
}
