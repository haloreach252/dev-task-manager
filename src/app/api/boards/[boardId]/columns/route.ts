// src/app/api/boards/[boardId]/columns/route.ts

import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { getUserPermissions } from '@/lib/permissions';
import { validateCreateColumn, type ColumnsResponse } from './types';
import {
	createErrorResponse,
	createSuccessResponse,
} from '@/app/api/shared/utils';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(
	req: Request,
	props: { params: Promise<{ boardId: string }> }
) {
	try {
		const { boardId } = await props.params;
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
		if (!userPermissions['viewBoards'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'You do not have permission to view this board',
				},
				403
			);
		}

		const columns = await prisma.column.findMany({
			where: { boardId },
			orderBy: { order: 'asc' },
			include: {
				tasks: {
					orderBy: { order: 'asc' },
					include: {
						checklists: { include: { items: true } },
						attachments: true,
						labels: { include: { label: true } },
					},
				},
			},
		});

		// Transform each task's labels to a simple array of Label objects
		const transformedColumns = columns.map((column) => ({
			...column,
			tasks: column.tasks.map((task) => ({
				...task,
				labels: task.labels.map((taskLabel) => ({
					id: taskLabel.label.id,
					name: taskLabel.label.name,
					color: taskLabel.label.backgroundColor || '#000000',
				})),
			})),
		}));

		return createSuccessResponse<ColumnsResponse>({
			columns: transformedColumns,
		});
	} catch (error) {
		console.error('GET Columns Error:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to fetch columns',
			},
			500
		);
	}
}

export async function POST(
	req: Request,
	props: { params: Promise<{ boardId: string }> }
) {
	try {
		const { boardId } = await props.params;
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
		const { success } = await rateLimit(user.id, 'createColumn', 20, 3600); // 20 columns per hour
		if (!success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message: 'You can only create 20 columns per hour',
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
						'You do not have permission to create columns in this board',
				},
				403
			);
		}

		const body = await req.json();

		// Validate input
		const validationError = validateCreateColumn(body);
		if (validationError) {
			return validationError;
		}

		const existingColumns = await prisma.column.findMany({
			where: { boardId },
		});

		const order = existingColumns.length;

		const newColumn = await prisma.column.create({
			data: {
				title: body.title,
				order,
				boardId,
			},
		});

		return createSuccessResponse(newColumn);
	} catch (error) {
		console.error('POST Column Error:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to create column',
			},
			500
		);
	}
}
