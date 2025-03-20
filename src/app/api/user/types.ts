import { z } from 'zod';

export const UpdateProfileSchema = z.object({
	name: z
		.string()
		.min(2, 'Name must be at least 2 characters')
		.max(50, 'Name must be less than 50 characters'),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export type UserError = {
	code: string;
	message: string;
};

export type UserResponse<T = unknown> = {
	success: boolean;
	error?: UserError;
	data?: T;
};

export const validateUpdateProfile = (data: unknown): UserError | null => {
	try {
		UpdateProfileSchema.parse(data);
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
