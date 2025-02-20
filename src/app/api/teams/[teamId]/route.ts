import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, props: { params: Promise<{ teamId: string }>}) {
    const params = await props.params;
    const team = await prisma.team.findUnique({
        where: { id: params.teamId }
    });

    if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404})
    }

    return NextResponse.json({ team });
}