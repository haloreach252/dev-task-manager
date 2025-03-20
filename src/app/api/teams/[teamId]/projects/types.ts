import { z } from 'zod';

export const CreateProjectSchema = z.object({
	name: z
		.string()
		.min(1, 'Project name is required')
		.max(100, 'Project name is too long'),
	description: z.string().max(500, 'Description is too long').optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

export type Project = {
	id: string;
	name: string;
	description: string | null;
	teamId: string;
	createdAt: Date;
	updatedAt: Date;
};

export type ProjectsResponse = {
	projects: Project[];
};

export type CreateProjectResponse = {
	project: Project;
};

export type UpdateProjectResponse = {
	project: Project;
};

export type DeleteProjectResponse = {
	message: string;
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

export const validateUpdateProject = (data: unknown) => {
	try {
		UpdateProjectSchema.parse(data);
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
