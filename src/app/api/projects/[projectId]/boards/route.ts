// src/app/api/projects/[projectId]/boards/route.ts

import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { checkPermissions } from '@/lib/permissions';
import { validateCreateBoard, type BoardWithTaskCount } from './types';
import {
	createErrorResponse,
	createSuccessResponse,
} from '../../../shared/utils';

export async function GET(
	req: Request,
	props: { params: Promise<{ projectId: string }> }
) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();
		const { projectId } = await props.params;

		if (!user || error) {
			return createErrorResponse(
				{
					code: 'UNAUTHORIZED',
					message: 'Unauthorized',
				},
				401
			);
		}

		const project = await prisma.project.findUnique({
			where: { id: projectId },
		});

		if (!project) {
			return createErrorResponse(
				{
					code: 'NOT_FOUND',
					message: 'Project not found',
				},
				404
			);
		}

		const hasPermission = await checkPermissions(user.id, project.teamId, [
			'viewProjects',
		]);

		if (!hasPermission) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'You do not have permission to view this project',
				},
				403
			);
		}

		const boards = await prisma.board.findMany({
			where: { projectId },
			include: {
				columns: {
					include: {
						tasks: true,
					},
				},
			},
			orderBy: { updatedAt: 'desc' },
		});

		// Calculate total tasks per board
		const boardsWithTaskCount: BoardWithTaskCount[] = boards.map(
			(board) => {
				const totalTasks = board.columns.reduce(
					(taskCount, column) => taskCount + column.tasks.length,
					0
				);

				return {
					id: board.id,
					name: board.name,
					visibility: board.visibility,
					totalTasks,
					updatedAt: board.updatedAt,
				};
			}
		);

		return createSuccessResponse({ boards: boardsWithTaskCount });
	} catch (error) {
		console.error('Error fetching boards:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to fetch boards',
			},
			500
		);
	}
}

export async function POST(
	req: Request,
	props: { params: Promise<{ projectId: string }> }
) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();
		const { projectId } = await props.params;

		if (!user || error) {
			return createErrorResponse(
				{
					code: 'UNAUTHORIZED',
					message: 'Unauthorized',
				},
				401
			);
		}

		const project = await prisma.project.findUnique({
			where: { id: projectId },
		});

		if (!project) {
			return createErrorResponse(
				{
					code: 'NOT_FOUND',
					message: 'Project not found',
				},
				404
			);
		}

		const hasPermission = await checkPermissions(user.id, project.teamId, [
			'createBoard',
		]);

		if (!hasPermission) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message:
						'You do not have permission to create boards in this project',
				},
				403
			);
		}

		const body = await req.json();

		// Validate input
		const validationError = validateCreateBoard(body);
		if (validationError) {
			return createErrorResponse(validationError);
		}

		const newBoard = await prisma.board.create({
			data: {
				name: body.name,
				visibility: body.visibility,
				projectId,
			},
		});

		return createSuccessResponse(newBoard);
	} catch (error) {
		console.error('Error creating board:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to create board',
			},
			500
		);
	}
}
