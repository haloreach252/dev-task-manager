import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase';

export async function GET(
	req: Request,
	props: { params: Promise<{ boardId: string }> }
) {
	const { boardId } = await props.params;
	const supabase = await createClient();

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (!user || error) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Fetch the board with visibility settings
		const board = await prisma.board.findUnique({
			where: { id: boardId },
			include: {
				columns: {
					orderBy: { order: 'asc' },
					include: { tasks: { orderBy: { order: 'asc' } } },
				},
				project: { include: { team: { include: { members: true } } } },
			},
		});

		if (!board) {
			return NextResponse.json(
				{ error: 'Board not found' },
				{ status: 404 }
			);
		}

		// Get the visibility of the board
		const { visibility, project } = board;

		// If the board is PRIVATE, check if the user is a member of the board
		if (visibility === 'PRIVATE') {
			const boardMember = await prisma.teamMember.findFirst({
				where: {
					userId: user.id,
					teamId: project.teamId,
				},
			});

			if (!boardMember) {
				return NextResponse.json(
					{
						error: 'Forbidden: You do not have access to this board',
					},
					{ status: 403 }
				);
			}
		}

		// If the board is TEAM, check if the user is in the team
		if (visibility === 'TEAM') {
			const isTeamMember = project.team.members.some(
				(member) => member.userId === user.id
			);

			if (!isTeamMember) {
				return NextResponse.json(
					{ error: 'Forbidden: You are not part of this team' },
					{ status: 403 }
				);
			}
		}

		return NextResponse.json(board);
	} catch (error) {
		console.error('GET Board Error:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch board' },
			{ status: 500 }
		);
	}
}
