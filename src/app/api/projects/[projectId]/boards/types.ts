import { z } from 'zod';
import { type BoardVisibility } from '@prisma/client';

export const CreateBoardSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be less than 100 characters'),
	visibility: z.enum(['PUBLIC', 'PRIVATE', 'TEAM']).default('PUBLIC'),
});

export const UpdateBoardSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be less than 100 characters'),
});

export type CreateBoardInput = z.infer<typeof CreateBoardSchema>;
export type UpdateBoardInput = z.infer<typeof UpdateBoardSchema>;

export type BoardWithTaskCount = {
	id: string;
	name: string;
	visibility: BoardVisibility;
	totalTasks: number;
	updatedAt: Date;
};

export type BoardsResponse = {
	boards: BoardWithTaskCount[];
};

export const validateCreateBoard = (data: unknown) => {
	try {
		CreateBoardSchema.parse(data);
		return null;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				code: 'VALIDATION_ERROR',
				message: error.errors[0].message,
			};
		}
		return {
			code: 'UNKNOWN_ERROR',
			message: 'An unknown error occurred',
		};
	}
};

export const validateUpdateBoard = (data: unknown) => {
	try {
		UpdateBoardSchema.parse(data);
		return null;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				code: 'VALIDATION_ERROR',
				message: error.errors[0].message,
			};
		}
		return {
			code: 'UNKNOWN_ERROR',
			message: 'An unknown error occurred',
		};
	}
};
