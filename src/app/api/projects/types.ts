import { z } from 'zod';

export const CreateProjectSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be less than 100 characters'),
	description: z
		.string()
		.max(500, 'Description must be less than 500 characters')
		.optional(),
	teamId: z.string().min(1, 'Team ID is required'),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export type ProjectWithCounts = {
	id: string;
	name: string;
	description: string | null;
	teamId: string;
	team: {
		name: string;
	};
	updatedAt: Date;
	totalBoards: number;
	totalTasks: number;
};

export type ProjectsResponse = {
	projects: ProjectWithCounts[];
};

export type CreateProjectResponse = {
	id: string;
	name: string;
	description: string | null;
	teamId: string;
	createdAt: Date;
	updatedAt: Date;
};

export const validateCreateProject = (data: unknown) => {
	try {
		CreateProjectSchema.parse(data);
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
