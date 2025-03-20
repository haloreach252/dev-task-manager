import { z } from 'zod';
import { createErrorResponse } from '@/app/api/shared/utils';

export const CreateColumnSchema = z.object({
	title: z
		.string()
		.min(1, 'Title is required')
		.max(100, 'Title must be less than 100 characters'),
});

export const UpdateColumnSchema = z.object({
	title: z
		.string()
		.min(1, 'Title is required')
		.max(100, 'Title must be less than 100 characters')
		.optional(),
	backgroundColor: z
		.string()
		.regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
		.optional(),
});

export const ReorderColumnSchema = z.object({
	targetColumnId: z.string().min(1, 'Target column ID is required'),
});

export type CreateColumnInput = z.infer<typeof CreateColumnSchema>;
export type UpdateColumnInput = z.infer<typeof UpdateColumnSchema>;
export type ReorderColumnInput = z.infer<typeof ReorderColumnSchema>;

export type Column = {
	id: string;
	title: string;
	order: number;
	backgroundColor: string | null;
	boardId: string;
	createdAt: Date;
	updatedAt: Date;
	tasks: Array<{
		id: string;
		title: string;
		order: number;
		labels: Array<{
			id: string;
			name: string;
			color: string;
		}>;
	}>;
};

export type ColumnsResponse = {
	columns: Column[];
};

export const validateCreateColumn = (data: unknown) => {
	try {
		CreateColumnSchema.parse(data);
		return null;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return createErrorResponse({
				code: 'VALIDATION_ERROR',
				message: error.errors[0].message,
			});
		}
		return createErrorResponse({
			code: 'UNKNOWN_ERROR',
			message: 'An unknown error occurred',
		});
	}
};

export const validateUpdateColumn = (data: unknown) => {
	try {
		UpdateColumnSchema.parse(data);
		return null;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return createErrorResponse({
				code: 'VALIDATION_ERROR',
				message: error.errors[0].message,
			});
		}
		return createErrorResponse({
			code: 'UNKNOWN_ERROR',
			message: 'An unknown error occurred',
		});
	}
};

export const validateReorderColumn = (data: unknown) => {
	try {
		ReorderColumnSchema.parse(data);
		return null;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return createErrorResponse({
				code: 'VALIDATION_ERROR',
				message: error.errors[0].message,
			});
		}
		return createErrorResponse({
			code: 'UNKNOWN_ERROR',
			message: 'An unknown error occurred',
		});
	}
};
