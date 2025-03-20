import { NextResponse } from 'next/server';

export type ApiError = {
	code: string;
	message: string;
};

export function createErrorResponse(error: ApiError, status: number = 400) {
	return NextResponse.json(
		{
			success: false,
			error,
		},
		{
			status,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control':
					'no-store, no-cache, must-revalidate, proxy-revalidate',
				Pragma: 'no-cache',
				Expires: '0',
			},
		}
	);
}

export function createSuccessResponse<T>(data: T, status: number = 200) {
	return NextResponse.json(
		{
			success: true,
			data,
		},
		{
			status,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control':
					'no-store, no-cache, must-revalidate, proxy-revalidate',
				Pragma: 'no-cache',
				Expires: '0',
			},
		}
	);
}

export const validatePageNumber = (page: string | null): number => {
	const parsedPage = parseInt(page || '1', 10);
	return isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
};
