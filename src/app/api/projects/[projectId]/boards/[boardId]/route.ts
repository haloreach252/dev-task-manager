// src/app/api/projects/[projectId]/boards/[boardId]/route.ts

import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { checkPermissions } from '@/lib/permissions';
import { validateUpdateBoard } from '../types';
import {
	createErrorResponse,
	createSuccessResponse,
} from '../../../../shared/utils';

export async function PUT(
	request: Request,
	props: { params: Promise<{ projectId: string; boardId: string }> }
) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();
		const { projectId, boardId } = await props.params;

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

		const board = await prisma.board.findUnique({
			where: { id: boardId },
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

		const hasPermission = await checkPermissions(user.id, project.teamId, [
			'editBoard',
		]);

		if (!hasPermission) {
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
			return createErrorResponse(validationError);
		}

		const updatedBoard = await prisma.board.update({
			where: { id: boardId },
			data: { name: body.name },
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
	props: { params: Promise<{ projectId: string; boardId: string }> }
) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();
		const { projectId, boardId } = await props.params;

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

		const board = await prisma.board.findUnique({
			where: { id: boardId },
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

		const hasPermission = await checkPermissions(user.id, project.teamId, [
			'deleteBoard',
		]);

		if (!hasPermission) {
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
