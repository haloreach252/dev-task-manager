import { z } from 'zod';
import { type TeamRole } from '@prisma/client';

export const CreateTeamSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be less than 100 characters'),
	description: z
		.string()
		.max(500, 'Description must be less than 500 characters')
		.optional(),
});

export const UpdateTeamSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be less than 100 characters')
		.optional(),
	description: z
		.string()
		.max(500, 'Description must be less than 500 characters')
		.optional(),
});

export type CreateTeamInput = z.infer<typeof CreateTeamSchema>;
export type UpdateTeamInput = z.infer<typeof UpdateTeamSchema>;

export type TeamMember = {
	userId: string;
	teamRole: TeamRole;
	customPermissions: string;
};

export type TeamWithMembers = {
	id: string;
	name: string;
	description: string | null;
	members: TeamMember[];
	totalMembers: number;
};

export type TeamWithPermissions = {
	id: string;
	name: string;
	description: string | null;
	totalMembers: number;
	permissions: Record<string, boolean>;
};

export type TeamsResponse = {
	teams: TeamWithPermissions[];
};

export type CreateTeamResponse = {
	id: string;
	name: string;
	totalMembers: number;
};

export const validateCreateTeam = (data: unknown) => {
	try {
		CreateTeamSchema.parse(data);
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

export const validateUpdateTeam = (data: unknown) => {
	try {
		UpdateTeamSchema.parse(data);
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
