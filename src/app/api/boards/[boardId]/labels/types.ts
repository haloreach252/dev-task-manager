import { z } from 'zod';
import { createErrorResponse } from '@/app/api/shared/utils';

export const CreateLabelSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(50, 'Name must be less than 50 characters'),
	backgroundColor: z
		.string()
		.regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
});

export const UpdateLabelSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(50, 'Name must be less than 50 characters')
		.optional(),
	backgroundColor: z
		.string()
		.regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
		.optional(),
});

export type CreateLabelInput = z.infer<typeof CreateLabelSchema>;
export type UpdateLabelInput = z.infer<typeof UpdateLabelSchema>;

export type Label = {
	id: string;
	name: string;
	backgroundColor: string;
	boardId: string;
	createdAt: Date;
	updatedAt: Date;
};

export type LabelsResponse = {
	labels: Label[];
};

export const validateCreateLabel = (data: unknown) => {
	try {
		CreateLabelSchema.parse(data);
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

export const validateUpdateLabel = (data: unknown) => {
	try {
		UpdateLabelSchema.parse(data);
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
