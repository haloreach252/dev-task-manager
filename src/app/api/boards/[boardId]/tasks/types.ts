import { z } from 'zod';
import { createErrorResponse } from '@/app/api/shared/utils';

// Schema for creating a task
export const CreateTaskSchema = z.object({
	title: z
		.string()
		.min(1, 'Title is required')
		.max(100, 'Title must be less than 100 characters'),
	columnId: z.string().min(1, 'Column ID is required'),
	description: z.string().optional(),
	dueDate: z.string().optional(),
	checklists: z
		.array(
			z.object({
				name: z
					.string()
					.min(1, 'Checklist name is required')
					.max(50, 'Checklist name must be less than 50 characters'),
				items: z.array(
					z.object({
						text: z
							.string()
							.min(1, 'Item text is required')
							.max(
								200,
								'Item text must be less than 200 characters'
							),
						completed: z.boolean().default(false),
					})
				),
			})
		)
		.optional(),
	attachments: z
		.array(
			z.object({
				fileUrl: z.string().url('Invalid file URL'),
				fileName: z.string().min(1, 'File name is required'),
				fileType: z.string().min(1, 'File type is required'),
				fileSize: z.number().min(0, 'File size must be positive'),
			})
		)
		.optional(),
	labels: z
		.array(
			z.object({
				id: z.string().min(1, 'Label ID is required'),
			})
		)
		.optional(),
});

// Schema for updating a task
export const UpdateTaskSchema = CreateTaskSchema.partial();

// Schema for reordering a task
export const ReorderTaskSchema = z.object({
	targetId: z.string().optional(),
	targetColumnId: z.string().min(1, 'Target column ID is required'),
});

// Schema for managing task labels
export const ManageTaskLabelsSchema = z.object({
	labelId: z.string().min(1, 'Label ID is required'),
	action: z.enum(['add', 'remove'], {
		errorMap: () => ({
			message: 'Action must be either "add" or "remove"',
		}),
	}),
});

// Types
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type ReorderTaskInput = z.infer<typeof ReorderTaskSchema>;
export type ManageTaskLabelsInput = z.infer<typeof ManageTaskLabelsSchema>;

export type Task = {
	id: string;
	title: string;
	description?: string;
	dueDate?: Date;
	columnId: string;
	order: number;
	createdAt: Date;
	updatedAt: Date;
	checklists?: Checklist[];
	attachments?: FileAttachment[];
	labels?: Label[];
};

export type Checklist = {
	id: string;
	name: string;
	taskId: string;
	items: ChecklistItem[];
	createdAt: Date;
	updatedAt: Date;
};

export type ChecklistItem = {
	id: string;
	text: string;
	completed: boolean;
	checklistId: string;
	createdAt: Date;
	updatedAt: Date;
};

export type FileAttachment = {
	id: string;
	fileUrl: string;
	fileName: string;
	fileType: string;
	fileSize: number;
	taskId: string;
	createdAt: Date;
	updatedAt: Date;
};

export type Label = {
	id: string;
	name: string;
	backgroundColor: string;
	boardId: string;
	createdAt: Date;
	updatedAt: Date;
};

export type TaskResponse = {
	task: Task;
};

export type TasksResponse = {
	tasks: Task[];
};

// Validation functions
export const validateCreateTask = (data: unknown) => {
	try {
		return CreateTaskSchema.parse(data);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return createErrorResponse(
				{ code: 'VALIDATION_ERROR', message: 'Validation Error' },
				400
			);
		}
		return createErrorResponse(
			{ code: 'INTERNAL_ERROR', message: 'Internal Server Error' },
			500
		);
	}
};

export const validateUpdateTask = (data: unknown) => {
	try {
		return UpdateTaskSchema.parse(data);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return createErrorResponse(
				{ code: 'VALIDATION_ERROR', message: 'Validation Error' },
				400
			);
		}
		return createErrorResponse(
			{ code: 'INTERNAL_ERROR', message: 'Internal Server Error' },
			500
		);
	}
};

export const validateReorderTask = (data: unknown) => {
	try {
		return ReorderTaskSchema.parse(data);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return createErrorResponse(
				{ code: 'VALIDATION_ERROR', message: 'Validation Error' },
				400
			);
		}
		return createErrorResponse(
			{ code: 'INTERNAL_ERROR', message: 'Internal Server Error' },
			500
		);
	}
};

export const validateManageTaskLabels = (data: unknown) => {
	try {
		return ManageTaskLabelsSchema.parse(data);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return createErrorResponse(
				{ code: 'VALIDATION_ERROR', message: 'Validation Error' },
				400
			);
		}
		return createErrorResponse(
			{ code: 'INTERNAL_ERROR', message: 'Internal Server Error' },
			500
		);
	}
};
