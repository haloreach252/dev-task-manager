import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import prisma from "@/lib/prisma";

export async function GET() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user || error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = user.id;

        // Fetch projects where the user is a member of the team
        const projects = await prisma.project.findMany({
            where: {
                team: {
                    members: {
                        some: { userId }
                    }
                }
            },
            include: {
                team: true
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        return NextResponse.json({ projects });
    } catch (err) {
        console.error("Error fetching projects:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user || error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, description, teamId } = await request.json();

        if (!name || !teamId) {
            return NextResponse.json({ error: "Name and Team ID are required" }, { status: 400 });
        }

        const teamMembership = await prisma.teamMember.findFirst({
            where: {
                userId: user.id,
                teamId
            }
        });

        if (!teamMembership) {
            return NextResponse.json({ error: "User not part of the specified team" }, { status: 403 });
        }

        const newProject = await prisma.project.create({
            data: {
                name,
                description,
                teamId
            }
        });

        return NextResponse.json(newProject, { status: 201 });
    } catch (err) {
        console.error("Error creating project:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}