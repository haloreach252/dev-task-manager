// src/app/api/projects/[projectId]/boards/[boardId]/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { checkPermissions, getUserPermissions } from '@/lib/permissions';

export async function PUT(request: Request, props: { params: Promise<{ projectId: string; boardId: string }> }) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    const { projectId, boardId } = await props.params;

    if (!user || error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId }
    });

    if (!project) {
        return NextResponse.json({ error: "Error: Cannot find project" }, { status: 404 });
    }

    const hasPermission = await checkPermissions(user.id, project.teamId, ['editBoard']);

    if (!hasPermission) {
        return NextResponse.json({ error: "Forbidden: You do not have sufficient permission to do that" }, { status: 403 });
    }

    try {
        const { name } = await request.json();
        if (!name) {
            return NextResponse.json({ error: "Board name is required" }, { status: 400 });
        }

        const updatedBoard = await prisma.board.update({
            where: { id: boardId },
            data: { name }
        });

        return NextResponse.json(updatedBoard, { status: 200 });
    } catch (err) {
        console.error("Error updating board name:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
