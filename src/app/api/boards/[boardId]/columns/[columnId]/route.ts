// src/app/api/boards/[boardId]/columns/[columnId]/route.ts

import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { getUserPermissions } from '@/lib/permissions';
import { validateUpdateColumn } from '../types';
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
		const { success } = await rateLimit(user.id, 'updateColumn', 50, 3600); // 50 updates per hour
		if (!success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message: 'You can only update a column 20 times per hour',
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
						'You do not have permission to edit columns in this board',
				},
				403
			);
		}

		const column = await prisma.column.findUnique({
			where: { id: columnId },
		});

		if (!column) {
			return createErrorResponse(
				{
					code: 'NOT_FOUND',
					message: 'Column not found',
				},
				404
			);
		}

		const body = await req.json();

		// Validate input
		const validationError = validateUpdateColumn(body);
		if (validationError) {
			return validationError;
		}

		const updatedColumn = await prisma.column.update({
			where: { id: columnId },
			data: {
				title: body.title,
				backgroundColor: body.backgroundColor,
			},
		});

		return createSuccessResponse(updatedColumn);
	} catch (error) {
		console.error('Error updating column:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to update column',
			},
			500
		);
	}
}

export async function DELETE(
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
		const { success } = await rateLimit(user.id, 'deleteColumn', 50, 3600); // 50 deletes per hour
		if (!success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message: 'You can only delete 5 columns per hour',
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
		if (!userPermissions['deleteColumns'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message:
						'You do not have permission to delete columns in this board',
				},
				403
			);
		}

		const column = await prisma.column.findUnique({
			where: { id: columnId },
		});

		if (!column) {
			return createErrorResponse(
				{
					code: 'NOT_FOUND',
					message: 'Column not found',
				},
				404
			);
		}

		await prisma.column.delete({
			where: { id: columnId },
		});

		return createSuccessResponse({
			message: 'Column deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting column:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to delete column',
			},
			500
		);
	}
}
