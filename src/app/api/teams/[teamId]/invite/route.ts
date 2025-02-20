import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request, props: { params: Promise<{ teamId: string }> }) {
  const params = await props.params;
  const { email } = await request.json();
  // Generate a simple invite token (consider using a more robust method)
  const token = Math.random().toString(36).substr(2, 9);
  const invite = await prisma.invite.create({
    data: {
      email,
      token,
      role: "Viewer", // default role for invited users
      teamId: params.teamId,
      status: "pending",
    },
  });
  // Optionally: send an email invite here
  return NextResponse.json({ invite }, { status: 201 });
}