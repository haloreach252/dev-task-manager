import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, props: { params: Promise<{ teamId: string }>}) {
    const params = await props.params;
    const projects = await prisma.project.findMany({
        where: { teamId: params.teamId }
    })

    return NextResponse.json({ projects });
}