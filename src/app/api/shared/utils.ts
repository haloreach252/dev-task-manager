import { NextResponse } from 'next/server';
import { type ApiError } from './types';

export const createErrorResponse = (error: ApiError, status: number = 400) => {
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

export const createSuccessResponse = <T>(data: T) => {
	return NextResponse.json(
		{ success: true, data },
		{
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

export const validatePageNumber = (page: string | null): number => {
	const parsedPage = parseInt(page || '1', 10);
	return isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
};
