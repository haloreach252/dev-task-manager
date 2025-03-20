// src/app/api/projects/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase-db';
import { getUserPermissions } from '@/lib/permissions';
import type { Database } from '@/lib/supabase-db';

type Project = Database['public']['Tables']['projects']['Row'];
type Board = Database['public']['Tables']['boards']['Row'];
type Column = Database['public']['Tables']['columns']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];

interface ProjectWithRelations extends Project {
	team: {
		name: string;
	};
	boards: Array<
		Board & {
			columns: Array<
				Column & {
					tasks: Task[];
				}
			>;
		}
	>;
}

interface ProjectWithCounts {
	id: string;
	name: string;
	description: string | null;
	teamId: string;
	team: {
		name: string;
	};
	updatedAt: string;
	totalBoards: number;
	totalTasks: number;
}

export async function GET() {
	const supabaseAuth = await createClient();
	const {
		data: { user },
		error,
	} = await supabaseAuth.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const userId = user.id;

		// Fetch projects where the user is a member of the team
		const { data: projects, error: projectsError } = await supabase
			.from('projects')
			.select(
				`
                *,
                team:teams(*),
                boards:boards(
                    *,
                    columns:columns(
                        *,
                        tasks:tasks(*)
                    )
                )
            `
			)
			.eq('team.members.user_id', userId)
			.order('updated_at', { ascending: false });

		if (projectsError) {
			console.error('Error fetching projects:', projectsError);
			return NextResponse.json(
				{ error: 'Internal Server Error' },
				{ status: 500 }
			);
		}

		// Map through projects to calculate totalBoards & totalTasks
		const projectsWithCounts = (projects as ProjectWithRelations[]).map(
			(project) => {
				const totalBoards = project.boards.length;
				const totalTasks = project.boards.reduce(
					(taskCount: number, board) => {
						return (
							taskCount +
							board.columns.reduce(
								(colCount: number, column) =>
									colCount + column.tasks.length,
								0
							)
						);
					},
					0
				);

				return {
					id: project.id,
					name: project.name,
					description: project.description,
					teamId: project.team_id,
					team: {
						name: project.team.name,
					},
					updatedAt: project.updated_at,
					totalBoards,
					totalTasks,
				};
			}
		);

		const filteredProjects: ProjectWithCounts[] = [];

		for (const project of projectsWithCounts) {
			const userPermissions = await getUserPermissions(
				userId,
				project.teamId
			);

			if (userPermissions['viewProjects'] || userPermissions['*']) {
				filteredProjects.push(project);
			}
		}

		return NextResponse.json({ projects: filteredProjects });
	} catch (error) {
		console.error('Error in projects route:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	const supabaseAuth = await createClient();
	const {
		data: { user },
		error,
	} = await supabaseAuth.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { name, description, teamId } = await request.json();

		if (!name || !teamId) {
			return NextResponse.json(
				{ error: 'Name and Team ID are required' },
				{ status: 400 }
			);
		}

		// Check if user is a member of the team
		const { data: teamMember, error: teamError } = await supabase
			.from('team_members')
			.select('*')
			.eq('user_id', user.id)
			.eq('team_id', teamId)
			.single();

		if (teamError || !teamMember) {
			return NextResponse.json(
				{ error: 'User not part of the specified team' },
				{ status: 403 }
			);
		}

		// Create new project
		const { data: newProject, error: projectError } = await supabase
			.from('projects')
			.insert({
				name,
				description,
				team_id: teamId,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.select()
			.single();

		if (projectError) {
			console.error('Error creating project:', projectError);
			return NextResponse.json(
				{ error: 'Internal Server Error' },
				{ status: 500 }
			);
		}

		return NextResponse.json(newProject, { status: 201 });
	} catch (err) {
		console.error('Error creating project:', err);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
