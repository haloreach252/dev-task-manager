import { z } from 'zod';

export const AcceptInviteSchema = z.object({
	token: z
		.string()
		.min(1, 'Token is required')
		.max(255, 'Token must be less than 255 characters'),
});

export type AcceptInviteInput = z.infer<typeof AcceptInviteSchema>;

export type InviteResponse = {
	message: string;
};

export const validateAcceptInvite = (data: unknown) => {
	try {
		AcceptInviteSchema.parse(data);
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
