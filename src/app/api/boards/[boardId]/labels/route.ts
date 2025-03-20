// src/app/api/boards/[boardId]/labels/route.ts

import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { getUserPermissions } from '@/lib/permissions';
import {
	validateCreateLabel,
	validateUpdateLabel,
	type LabelsResponse,
} from './types';
import {
	createErrorResponse,
	createSuccessResponse,
} from '@/app/api/shared/utils';
import { rateLimit } from '@/lib/rate-limit';

// Fetch all labels for a board
export async function GET(
	request: Request,
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

		const labels = await prisma.label.findMany({
			where: { boardId },
			orderBy: { name: 'asc' },
		});

		// Transform labels to match the expected type
		const transformedLabels = labels.map((label) => ({
			...label,
			backgroundColor: label.backgroundColor || '#000000',
		}));

		return createSuccessResponse<LabelsResponse>({
			labels: transformedLabels,
		});
	} catch (error) {
		console.error('Error fetching labels:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to fetch labels',
			},
			500
		);
	}
}

// Create a new label
export async function POST(
	request: Request,
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
		const { success } = await rateLimit(user.id, 'createLabel', 20, 3600); // 20 labels per hour
		if (!success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message: 'You can only create 20 labels per hour',
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
		if (!userPermissions['createLabels'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message:
						'You do not have permission to create labels in this board',
				},
				403
			);
		}

		const body = await request.json();

		// Validate input
		const validationError = validateCreateLabel(body);
		if (validationError) {
			return validationError;
		}

		const newLabel = await prisma.label.create({
			data: {
				name: body.name,
				backgroundColor: body.backgroundColor,
				boardId,
			},
		});

		return createSuccessResponse(newLabel, 201);
	} catch (error) {
		console.error('Error creating label:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to create label',
			},
			500
		);
	}
}

// Update a label
export async function PATCH(
	request: Request,
	props: { params: Promise<{ boardId: string; labelId: string }> }
) {
	try {
		const { boardId, labelId } = await props.params;
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
		const { success } = await rateLimit(user.id, 'updateLabel', 20, 3600); // 20 updates per hour
		if (!success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message: 'You can only update 20 labels per hour',
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
		if (!userPermissions['editLabels'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message:
						'You do not have permission to edit labels in this board',
				},
				403
			);
		}

		const label = await prisma.label.findUnique({
			where: { id: labelId },
		});

		if (!label) {
			return createErrorResponse(
				{
					code: 'NOT_FOUND',
					message: 'Label not found',
				},
				404
			);
		}

		const body = await request.json();

		// Validate input
		const validationError = validateUpdateLabel(body);
		if (validationError) {
			return validationError;
		}

		const updatedLabel = await prisma.label.update({
			where: { id: labelId },
			data: {
				name: body.name,
				backgroundColor: body.backgroundColor,
			},
		});

		return createSuccessResponse(updatedLabel);
	} catch (error) {
		console.error('Error updating label:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to update label',
			},
			500
		);
	}
}

// Delete a label
export async function DELETE(
	request: Request,
	props: { params: Promise<{ boardId: string; labelId: string }> }
) {
	try {
		const { boardId, labelId } = await props.params;
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
		const { success } = await rateLimit(user.id, 'deleteLabel', 5, 3600); // 5 deletions per hour
		if (!success) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message: 'You can only delete 5 labels per hour',
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
		if (!userPermissions['deleteLabels'] && !userPermissions['*']) {
			return createErrorResponse(
				{
					code: 'FORBIDDEN',
					message:
						'You do not have permission to delete labels in this board',
				},
				403
			);
		}

		const label = await prisma.label.findUnique({
			where: { id: labelId },
		});

		if (!label) {
			return createErrorResponse(
				{
					code: 'NOT_FOUND',
					message: 'Label not found',
				},
				404
			);
		}

		await prisma.label.delete({
			where: { id: labelId },
		});

		return createSuccessResponse({ message: 'Label deleted successfully' });
	} catch (error) {
		console.error('Error deleting label:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to delete label',
			},
			500
		);
	}
}
