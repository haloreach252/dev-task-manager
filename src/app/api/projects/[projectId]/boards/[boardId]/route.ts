// src/app/api/projects/[projectId]/boards/[boardId]/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { projectId: string; boardId: string } }) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user || error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name } = await request.json();
        if (!name) {
            return NextResponse.json({ error: "Board name is required" }, { status: 400 });
        }

        const updatedBoard = await prisma.board.update({
            where: { id: params.boardId },
            data: { name }
        });

        return NextResponse.json(updatedBoard, { status: 200 });
    } catch (err) {
        console.error("Error updating board name:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
