import { z } from 'zod';

export type PermissionValue = boolean | number | string;

export const CreateRoleSchema = z.object({
	name: z
		.string()
		.min(1, 'Role name is required')
		.max(50, 'Role name must be less than 50 characters'),
	permissions: z.string().refine((val) => {
		try {
			const parsed = JSON.parse(val);
			return typeof parsed === 'object' && parsed !== null;
		} catch {
			return false;
		}
	}, 'Permissions must be a valid JSON object'),
});

export const UpdateRoleSchema = CreateRoleSchema.partial();

export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;

export type Role = {
	id: string;
	name: string;
	canDelete: boolean;
	permissions: Record<string, PermissionValue>;
};

export type RolesResponse = {
	roles: Role[];
};

export type CreateRoleResponse = {
	newTeamRole: Role;
};

export type UpdateRoleResponse = {
	updatedRole: Role;
};

export const validateCreateRole = (data: unknown) => {
	try {
		CreateRoleSchema.parse(data);
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

export const validateUpdateRole = (data: unknown) => {
	try {
		UpdateRoleSchema.parse(data);
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
