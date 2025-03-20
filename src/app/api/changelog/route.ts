import prisma from '@/lib/prisma';
import { type PaginatedResponse } from '../shared/types';
import {
	createErrorResponse,
	createSuccessResponse,
	validatePageNumber,
} from '../shared/utils';

const PAGE_SIZE = 10;

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const page = validatePageNumber(searchParams.get('page'));

		const [changelog, totalEntries] = await Promise.all([
			prisma.changelog.findMany({
				orderBy: { date: 'desc' },
				skip: (page - 1) * PAGE_SIZE,
				take: PAGE_SIZE,
			}),
			prisma.changelog.count(),
		]);

		const totalPages = Math.ceil(totalEntries / PAGE_SIZE);

		const response: PaginatedResponse<(typeof changelog)[0]> = {
			data: changelog,
			totalPages,
			currentPage: page,
			totalItems: totalEntries,
		};

		return createSuccessResponse(response);
	} catch (error) {
		console.error('Error fetching changelog:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to fetch changelog',
			},
			500
		);
	}
}
