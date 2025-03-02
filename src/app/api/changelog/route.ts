import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const PAGE_SIZE = 10;

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const page = parseInt(searchParams.get('page') || '1', 10);

		const changelog = await prisma.changelog.findMany({
			orderBy: { date: 'desc' },
			skip: (page - 1) * PAGE_SIZE,
			take: PAGE_SIZE,
		});

		const totalEntries = await prisma.changelog.count();
		const totalPages = Math.ceil(totalEntries / PAGE_SIZE);

		return NextResponse.json({ changelog, totalPages });
	} catch (error) {
		console.error('Error fetching changelog:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch changelog' },
			{ status: 500 }
		);
	}
}
