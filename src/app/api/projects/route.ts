// src/app/api/projects/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import prisma from "@/lib/prisma";
import { checkPermissions, getUserPermissions } from "@/lib/permissions";
import { type Project } from "@prisma/client";

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
                team: true,
                boards: {
                    include: {
                        columns: {
                            include: {
                                tasks: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        // Map through projects to calculate totalBoards & totalTasks
        const projectsWithCounts = projects.map(project => {
            const totalBoards = project.boards.length;
            const totalTasks = project.boards.reduce((taskCount, board) => {
                return taskCount + board.columns.reduce((colCount, column) => colCount + column.tasks.length, 0);
            }, 0);

            return {
                id: project.id,
                name: project.name,
                description: project.description,
                teamId: project.teamId,
                team: {
                    name: project.team.name
                },
                updatedAt: project.updatedAt,
                totalBoards,
                totalTasks
            };
        });

        const filteredProjects = [];

        for (const project of projectsWithCounts) {
            const hasPermission = await checkPermissions(userId, project.teamId, ['viewProjects']);

            if (hasPermission) {
                filteredProjects.push(project);
            }
        }

        return NextResponse.json({ projects: filteredProjects });
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

        const hasPermission = await checkPermissions(user.id, teamId, ['createProjects']);

        if (!hasPermission) {
            return NextResponse.json({ error: "Forbidden: You do not have permission to create projects with that team"}, { status: 403 });
        }

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