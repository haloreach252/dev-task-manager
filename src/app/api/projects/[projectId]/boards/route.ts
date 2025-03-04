// src/app/api/projects/[projectId]/boards/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { checkPermissions, getUserPermissions } from '@/lib/permissions';

export async function GET(req: Request, props: { params: Promise<{ projectId: string }> }) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    const { projectId } = await props.params;

    if (!user || error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId }
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const hasPermission = await checkPermissions(user.id, project.teamId, ['viewProjects']);

    if (!hasPermission) {
        return NextResponse.json({ error: "Forbidden: You do not have permission to view this project" }, { status: 403 });
    }

    try {
        const boards = await prisma.board.findMany({
            where: { projectId },
            include: {
                columns: {
                    include: {
                        tasks: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Calculate total tasks per board
        const boardsWithTaskCount = boards.map(board => {
            const totalTasks = board.columns.reduce((taskCount, column) => 
                taskCount + column.tasks.length, 0);
            
            return {
                id: board.id,
                name: board.name,
                visibility: board.visibility,
                totalTasks,
                updatedAt: board.updatedAt
            };
        });

        return NextResponse.json({ boards: boardsWithTaskCount });
    } catch (err) {
        console.error("GET Boards Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
