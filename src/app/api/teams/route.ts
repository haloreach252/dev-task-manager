import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    // TOOD: FIX THIS
    const userId = 'demo-user-id';

    const teams = await prisma.team.findMany({
        where: {
            members: { some: { userId }},
        }
    });

    return NextResponse.json({ teams });
}

export async function POST(request: Request) {
    const { name } = await request.json();
    const userId = 'demo-user-id';

    // Create the team and a default "Admin" role for the team
    const team = await prisma.team.create({
        data: {
            name,
            roles: {
                create: {
                    name: "Admin",
                    permissions: {}, // Default permissions as json
                }
            }
        }
    });

    // Fetch the created default admin role
    const adminRole = await prisma.teamRole.findFirst({
        where: { teamId: team.id, name: "Admin" }
    })

    // Add the current user as a team member with the admin role
    await prisma.teamMember.create({
        data: {
            teamId: team.id,
            userId,
            teamRoleId: adminRole?.id || "",
            customPermissions: {},
        }
    })

    return NextResponse.json(team, { status: 201 });
}