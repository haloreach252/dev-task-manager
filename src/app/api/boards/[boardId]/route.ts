import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
	req: Request,
	{ params }: { params: { boardId: string } }
) {
	const { boardId } = await params;

	try {
		const board = await prisma.board.findUnique({
			where: { id: boardId },
			include: {
				columns: {
					orderBy: { order: 'asc' },
					include: { tasks: { orderBy: { order: 'asc' } } },
				},
			},
		});

		if (!board) {
			return NextResponse.json(
				{ error: 'Board not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json(board);
	} catch (error) {
		console.error('GET Board Error:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch board' },
			{ status: 500 }
		);
	}
}

export async function PUT(
	req: Request,
	{ params }: { params: { boardId: string } }
) {
	const { boardId } = await params;
	const { name, visibility } = await req.json();

	try {
		const updatedBoard = await prisma.board.update({
			where: { id: boardId },
			data: { name, visibility },
		});

		return NextResponse.json(updatedBoard);
	} catch (error) {
		console.error('PUT Board Error:', error);
		return NextResponse.json(
			{ error: 'Failed to update board' },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: { boardId: string } }
) {
	const { boardId } = await params;

	try {
		// Delete related columns and tasks before deleting the board
		await prisma.task.deleteMany({ where: { column: { boardId } } });
		await prisma.column.deleteMany({ where: { boardId } });
		await prisma.board.delete({ where: { id: boardId } });

		return NextResponse.json({ message: 'Board deleted' });
	} catch (error) {
		console.error('DELETE Board Error:', error);
		return NextResponse.json(
			{ error: 'Failed to delete board' },
			{ status: 500 }
		);
	}
}
