import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { teamId: string }}) {
    const projects = await prisma.project.findMany({
        where: { teamId: params.teamId }
    })

    return NextResponse.json({ projects });
}