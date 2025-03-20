import { z } from 'zod';

export const PermissionsRequestSchema = z
	.object({
		teamId: z.string().optional(),
		teamIds: z.array(z.string()).optional(),
	})
	.refine(
		(data) => data.teamId || (data.teamIds && data.teamIds.length > 0),
		{
			message: 'Either teamId or teamIds must be provided',
			path: ['teamId', 'teamIds'],
		}
	);

export type PermissionsRequest = z.infer<typeof PermissionsRequestSchema>;

export type PermissionsResponse = {
	permissions: Record<string, Record<string, boolean>>;
};

export const validatePermissionsRequest = (data: unknown) => {
	try {
		PermissionsRequestSchema.parse(data);
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
