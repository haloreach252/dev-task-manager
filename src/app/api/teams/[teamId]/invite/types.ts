import { z } from 'zod';

export const CreateInviteSchema = z.object({
	email: z.string().email('Invalid email address'),
	roleId: z.string().optional(),
	expiresIn: z.number().min(1).max(168).optional(), // Hours, max 1 week
});

export type CreateInviteInput = z.infer<typeof CreateInviteSchema>;

export type InviteResponse = {
	inviteLink: string;
	inviteId: string;
};

export const validateCreateInvite = (data: unknown) => {
	try {
		CreateInviteSchema.parse(data);
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
