import { NextResponse } from 'next/server';
import { type AuthError } from './types';

export const createErrorResponse = (error: AuthError, status: number = 400) => {
	return NextResponse.json(
		{ success: false, error },
		{
			status,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-store, no-cache, must-revalidate',
				'X-Content-Type-Options': 'nosniff',
				'X-Frame-Options': 'DENY',
				'X-XSS-Protection': '1; mode=block',
			},
		}
	);
};

export const createSuccessResponse = (
	data: Record<string, unknown> = { success: true }
) => {
	return NextResponse.json(data, {
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-store, no-cache, must-revalidate',
			'X-Content-Type-Options': 'nosniff',
			'X-Frame-Options': 'DENY',
			'X-XSS-Protection': '1; mode=block',
		},
	});
};

export const createRedirectResponse = (url: string) => {
	return NextResponse.redirect(url, {
		headers: {
			'Cache-Control': 'no-store, no-cache, must-revalidate',
			'X-Content-Type-Options': 'nosniff',
			'X-Frame-Options': 'DENY',
			'X-XSS-Protection': '1; mode=block',
		},
	});
};
