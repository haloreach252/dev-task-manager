import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { getUserPermissions } from '@/lib/permissions';
import { validateCreateBoard, type BoardWithTaskCount } from './types';
import { createErrorResponse, createSuccessResponse } from '../shared/utils';
import { rateLimit } from '@/lib/rate-limit';
import { type Prisma } from '@prisma/client';

export async function GET(req: Request) {
	try {
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

		// Get query parameters
		const url = new URL(req.url);
		const projectId = url.searchParams.get('projectId');
		const teamId = url.searchParams.get('teamId');

		if (!projectId && !teamId) {
			return createErrorResponse(
				{
					code: 'BAD_REQUEST',
					message: 'Either projectId or teamId is required',
				},
				400
			);
		}

		// Check permissions
		if (teamId) {
			const userPermissions = await getUserPermissions(user.id, teamId);
			if (!userPermissions['viewBoards'] && !userPermissions['*']) {
				return createErrorResponse(
					{
						code: 'FORBIDDEN',
						message:
							'You do not have permission to view boards in this team',
					},
					403
				);
			}
		}

		// Build the query
		const whereClause: Prisma.BoardWhereInput = {};
		if (projectId) {
			whereClause.projectId = projectId;
		} else if (teamId) {
			whereClause.project = {
				teamId,
			};
		}

		// Add visibility conditions
		whereClause.OR = [
			{ visibility: 'PUBLIC' },
			{
				visibility: 'TEAM',
				project: {
					team: {
						members: {
							some: {
								userId: user.id,
							},
						},
					},
				},
			},
			{
				visibility: 'PRIVATE',
				project: {
					team: {
						members: {
							some: {
								userId: user.id,
							},
						},
					},
				},
			},
		];

		const boards = await prisma.board.findMany({
			where: whereClause,
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

export async function POST(req: Request) {
	try {
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
		const { success } = await rateLimit(user.id, 'createBoard', 10, 3600); // 10 boards per hour
		if (!success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message: 'You can only create 10 boards per hour',
				},
				429
			);
		}

		const body = await req.json();

		// Validate input
		const validationError = validateCreateBoard(body);
		if (validationError) {
			return validationError;
		}

		// Get the project to check team membership and permissions
		const project = await prisma.project.findUnique({
			where: { id: body.projectId },
			include: {
				team: {
					include: {
						members: true,
					},
				},
			},
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

		// Check team membership and permissions
		const userPermissions = await getUserPermissions(
			user.id,
			project.teamId
		);
		if (!userPermissions['createBoard'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message:
						'You do not have permission to create boards in this project',
				},
				403
			);
		}

		// Create the board with default columns
		const newBoard = await prisma.$transaction(async (tx) => {
			const board = await tx.board.create({
				data: {
					name: body.name,
					visibility: body.visibility,
					projectId: body.projectId,
				},
			});

			// Create default columns
			const defaultColumns = ['To Do', 'In Progress', 'Done'];
			await Promise.all(
				defaultColumns.map((name, index) =>
					tx.column.create({
						data: {
							title: name,
							order: index,
							boardId: board.id,
						},
					})
				)
			);

			return board;
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
