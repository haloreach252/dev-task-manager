// src/app/api/boards/[boardId]/labels/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkPermissions } from "@/lib/permissions";
import { createClient } from "@/lib/supabase";

// Fetch all labels for a board
export async function GET(request: Request, props: { params: Promise<{ boardId: string }>}) {
    const { boardId } = await props.params;

	const supabase = await createClient();
	const { data: { user }, error } = await supabase.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
	}

	const project = await prisma.project.findFirst({
		where: { boards: { some: { id: boardId }}}
	})

	if (!project) {
		return NextResponse.json({ error: "Project not found" }, { status: 404})
	}

	const hasPermission = await checkPermissions(user.id, project.teamId, ['viewBoards']);

	if (!hasPermission) {
		return NextResponse.json({ error: "Forbidden: You do not have permission to view this boards details" }, { status: 403 });
	}

    try {
        const labels = await prisma.label.findMany({
            where: { boardId },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(labels);
    } catch (error) {
        console.error('Error fetching labels: ', error);
        return NextResponse.json({ error: "Failed to fetch labels" }, { status: 500 })
    }
}

// Create a new label
export async function POST(
	request: Request,
	props: { params: Promise<{ boardId: string }> }
) {
	const { boardId } = await props.params;
	const { name, backgroundColor } = await request.json();

	const supabase = await createClient();
	const { data: { user }, error } = await supabase.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
	}

	const project = await prisma.project.findFirst({
		where: { boards: { some: { id: boardId }}}
	})

	if (!project) {
		return NextResponse.json({ error: "Project not found" }, { status: 404})
	}

	const hasPermission = await checkPermissions(user.id, project.teamId, ['createLabels']);

	if (!hasPermission) {
		return NextResponse.json({ error: "Forbidden: You do not have permission to create labels" }, { status: 403 });
	}

	try {
		const newLabel = await prisma.label.create({
			data: {
				name,
				backgroundColor,
				boardId,
			},
		});

		return NextResponse.json(newLabel, { status: 201 });
	} catch (error) {
		console.error('Error creating label:', error);
		return NextResponse.json({ error: 'Failed to create label' }, { status: 500 });
	}
}

// Update a label
export async function PATCH(
	request: Request,
	props: { params: Promise<{ boardId: string; labelId: string }> }
) {
	const { boardId, labelId } = await props.params;
	const { name, backgroundColor } = await request.json();

	const supabase = await createClient();
	const { data: { user }, error } = await supabase.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
	}

	const project = await prisma.project.findFirst({
		where: { boards: { some: { id: boardId }}}
	})

	if (!project) {
		return NextResponse.json({ error: "Project not found" }, { status: 404})
	}

	const hasPermission = await checkPermissions(user.id, project.teamId, ['editLabels']);

	if (!hasPermission) {
		return NextResponse.json({ error: "Forbidden: You do not have permission to edit labels" }, { status: 403 });
	}

	try {
		const updatedLabel = await prisma.label.update({
			where: { id: labelId },
			data: {
				name,
				backgroundColor,
			},
		});

		return NextResponse.json(updatedLabel);
	} catch (error) {
		console.error('Error updating label:', error);
		return NextResponse.json({ error: 'Failed to update label' }, { status: 500 });
	}
}

// Delete a label
export async function DELETE(
	request: Request,
	props: { params: Promise<{ boardId: string; labelId: string }> }
) {
	const { boardId, labelId } = await props.params;

	const supabase = await createClient();
	const { data: { user }, error } = await supabase.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
	}

	const project = await prisma.project.findFirst({
		where: { boards: { some: { id: boardId }}}
	})

	if (!project) {
		return NextResponse.json({ error: "Project not found" }, { status: 404})
	}

	const hasPermission = await checkPermissions(user.id, project.teamId, ['deleteLabels']);

	if (!hasPermission) {
		return NextResponse.json({ error: "Forbidden: You do not have permission to delete labels" }, { status: 403 });
	}

	try {
		await prisma.label.delete({
			where: { id: labelId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting label:', error);
		return NextResponse.json({ error: 'Failed to delete label' }, { status: 500 });
	}
}