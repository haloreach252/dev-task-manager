// src/app/api/boards/[boardId]/labels/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Fetch all labels for a board
export async function GET(request: Request, props: { params: Promise<{ boardId: string }>}) {
    const { boardId } = await props.params;

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
	const { labelId } = await props.params;
	const { name, backgroundColor } = await request.json();

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
	const { labelId } = await props.params;

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