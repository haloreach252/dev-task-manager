// src/app/api/boards/[boardId]/columns/[columnId]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
	req: Request,
	props: { params: Promise<{ boardId: string; columnId: string }> }
) {
	try {
		const { columnId } = await props.params;
		const { backgroundColor } = await req.json();

		// Optionally validate that a backgroundColor is provided
		if (!backgroundColor) {
			return NextResponse.json(
				{ error: 'backgroundColor is required' },
				{ status: 400 }
			);
		}

		const updatedColumn = await prisma.column.update({
			where: { id: columnId },
			data: { backgroundColor },
		});

		return NextResponse.json(updatedColumn);
	} catch (error) {
		console.error('Error updating column backgroundColor:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
