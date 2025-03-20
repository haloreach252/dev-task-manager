import { z } from 'zod';

export const ContactFormSchema = z.object({
	name: z
		.string()
		.min(2, 'Name must be at least 2 characters')
		.max(50, 'Name must be less than 50 characters'),
	email: z.string().email('Invalid email address'),
	message: z
		.string()
		.min(10, 'Message must be at least 10 characters')
		.max(1000, 'Message must be less than 1000 characters'),
});

export type ContactFormInput = z.infer<typeof ContactFormSchema>;

export type ApiError = {
	code: string;
	message: string;
};

export type ApiResponse<T = unknown> = {
	success: boolean;
	error?: ApiError;
	data?: T;
};

export type PaginatedResponse<T> = {
	data: T[];
	totalPages: number;
	currentPage: number;
	totalItems: number;
};

export const validateContactForm = (data: unknown): ApiError | null => {
	try {
		ContactFormSchema.parse(data);
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
