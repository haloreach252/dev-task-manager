// src/app/api/projects/[projectId]/boards/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
	req: Request,
	props: { params: Promise<{ projectId: string }> }
) {
	const { projectId } = await props.params;

	try {
		const boards = await prisma.board.findMany({
			where: { projectId },
			orderBy: { createdAt: 'asc' },
		});

		return NextResponse.json(boards);
	} catch (error) {
		console.error('GET Boards Error:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch boards' },
			{ status: 500 }
		);
	}
}

export async function POST(
	req: Request,
	props: { params: Promise<{ projectId: string }> }
) {
	const { projectId } = await props.params;
	const { name, visibility } = await req.json();

	try {
		const newBoard = await prisma.board.create({
			data: {
				name,
				visibility,
				projectId,
			},
		});

		return NextResponse.json(newBoard);
	} catch (error) {
		console.error('POST Board Error:', error);
		return NextResponse.json(
			{ error: 'Failed to create board' },
			{ status: 500 }
		);
	}
}
