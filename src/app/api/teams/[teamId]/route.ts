import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { teamId: string }}) {
    const team = await prisma.team.findUnique({
        where: { id: params.teamId }
    });

    if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404})
    }

    return NextResponse.json({ team });
}