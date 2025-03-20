// src/app/api/boards/[boardId]/route.ts

import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { getUserPermissions } from '@/lib/permissions';
import { validateUpdateBoard } from '../types';
import { createErrorResponse, createSuccessResponse } from '../../shared/utils';
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

		// Fetch the board with visibility settings
		const board = await prisma.board.findUnique({
			where: { id: boardId },
			include: {
				columns: {
					orderBy: { order: 'asc' },
					include: { tasks: { orderBy: { order: 'asc' } } },
				},
				project: { include: { team: { include: { members: true } } } },
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

		const teamId = board.project.teamId;
		const userPermissions = await getUserPermissions(user.id, teamId);

		if (!userPermissions['viewBoards'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'You do not have permission to view this board',
				},
				403
			);
		}

		// Check visibility permissions
		const { visibility, project } = board;

		// If the board is PRIVATE, check if the user is a member of the team
		if (visibility === 'PRIVATE') {
			const isTeamMember = project.team.members.some(
				(member) => member.userId === user.id
			);

			if (!isTeamMember) {
				return createErrorResponse(
					{
						code: 'FORBIDDEN',
						message: 'You do not have access to this private board',
					},
					403
				);
			}
		}

		// If the board is TEAM, check if the user is in the team
		if (visibility === 'TEAM') {
			const isTeamMember = project.team.members.some(
				(member) => member.userId === user.id
			);

			if (!isTeamMember) {
				return createErrorResponse(
					{
						code: 'FORBIDDEN',
						message: 'You are not part of this team',
					},
					403
				);
			}
		}

		return createSuccessResponse(board);
	} catch (error) {
		console.error('GET Board Error:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to fetch board',
			},
			500
		);
	}
}

export async function PUT(
	request: Request,
	props: { params: Promise<{ boardId: string }> }
) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();
		const { boardId } = await props.params;

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
		const { success } = await rateLimit(user.id, 'updateBoard', 20, 3600); // 20 updates per hour
		if (!success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message: 'You can only update a board 20 times per hour',
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
		if (!userPermissions['editBoard'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'You do not have permission to edit this board',
				},
				403
			);
		}

		const body = await request.json();

		// Validate input
		const validationError = validateUpdateBoard(body);
		if (validationError) {
			return validationError;
		}

		const updatedBoard = await prisma.board.update({
			where: { id: boardId },
			data: {
				name: body.name,
				visibility: body.visibility,
			},
		});

		return createSuccessResponse(updatedBoard);
	} catch (error) {
		console.error('Error updating board:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to update board',
			},
			500
		);
	}
}

export async function DELETE(
	request: Request,
	props: { params: Promise<{ boardId: string }> }
) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();
		const { boardId } = await props.params;

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
		const { success } = await rateLimit(user.id, 'deleteBoard', 5, 3600); // 5 deletions per hour
		if (!success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message: 'You can only delete 5 boards per hour',
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
		if (!userPermissions['deleteBoard'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message: 'You do not have permission to delete this board',
				},
				403
			);
		}

		await prisma.board.delete({
			where: { id: boardId },
		});

		return createSuccessResponse({ message: 'Board deleted successfully' });
	} catch (error) {
		console.error('Error deleting board:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to delete board',
			},
			500
		);
	}
}
