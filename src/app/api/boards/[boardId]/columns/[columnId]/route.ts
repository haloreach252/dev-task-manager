// src/app/api/boards/[boardId]/columns/[columnId]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
	req: Request,
	props: { params: Promise<{ columnId: string }> }
) {
	const { columnId } = await props.params;
}
