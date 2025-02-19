import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  const members = await prisma.teamMember.findMany({
    where: { teamId: params.teamId },
    include: { user: true, teamRole: true },
  });
  return NextResponse.json({ members });
}