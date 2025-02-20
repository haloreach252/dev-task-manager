import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, props: { params: Promise<{ teamId: string }> }) {
  const params = await props.params;
  const members = await prisma.teamMember.findMany({
    where: { teamId: params.teamId },
    include: { user: true, teamRole: true },
  });
  return NextResponse.json({ members });
}