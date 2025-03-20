import prisma from '@/lib/prisma';
import { validateContactForm } from '../shared/types';
import { createErrorResponse, createSuccessResponse } from '../shared/utils';

const RATE_LIMIT = 5 * 60 * 1000; // 5 minutes
const rateLimitMap = new Map<string, number>(); // Temporary rate-limiting storage

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';

		// Validate input
		const validationError = validateContactForm(body);
		if (validationError) {
			return createErrorResponse(validationError);
		}

		// Rate limiting check
		const lastSubmission = rateLimitMap.get(ip);
		const now = Date.now();

		if (lastSubmission && now - lastSubmission < RATE_LIMIT) {
			return createErrorResponse(
				{
					code: 'RATE_LIMIT_EXCEEDED',
					message: 'You can only submit once every 5 minutes.',
				},
				429
			);
		}

		// Save to database
		const submission = await prisma.contactSubmission.create({
			data: {
				name: body.name,
				email: body.email,
				message: body.message,
			},
		});

		// Update rate limit tracking
		rateLimitMap.set(ip, now);

		return createSuccessResponse({
			message: 'Message sent successfully!',
			submission,
		});
	} catch (error) {
		console.error('Error submitting contact form:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to submit contact form',
			},
			500
		);
	}
}
