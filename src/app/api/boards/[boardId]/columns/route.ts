import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
	req: Request,
	{ params }: { params: { boardId: string } }
) {
	const { boardId } = await params;

	try {
		const columns = await prisma.column.findMany({
			where: { boardId },
			orderBy: { order: 'asc' },
			include: { tasks: { orderBy: { order: 'asc' } } },
		});

		return NextResponse.json(columns);
	} catch (error) {
		console.error('GET Columns Error:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch columns' },
			{ status: 500 }
		);
	}
}

export async function POST(
	req: Request,
	{ params }: { params: { boardId: string } }
) {
	const { boardId } = await params;
	const { title } = await req.json();

	try {
		const existingColumns = await prisma.column.findMany({
			where: { boardId },
		});

		const order = existingColumns.length;

		const newColumn = await prisma.column.create({
			data: {
				title,
				order,
				boardId,
			},
		});

		return NextResponse.json(newColumn);
	} catch (error) {
		console.error('POST Column Error:', error);
		return NextResponse.json(
			{ error: 'Failed to create column' },
			{ status: 500 }
		);
	}
}
