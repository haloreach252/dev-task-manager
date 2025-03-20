import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { getUserPermissions } from '@/lib/permissions';
import { validatePermissionsRequest } from './types';
import { createErrorResponse, createSuccessResponse } from '../shared/utils';

export async function POST(req: Request) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();

		if (error || !user) {
			return createErrorResponse(
				{
					code: 'UNAUTHORIZED',
					message: 'Unauthorized',
				},
				401
			);
		}

		const body = await req.json();

		// Validate input
		const validationError = validatePermissionsRequest(body);
		if (validationError) {
			return createErrorResponse(validationError);
		}

		// Get user's admin status
		const dbUser = await prisma.user.findUnique({
			where: { id: user.id },
			select: { isAdmin: true },
		});

		if (!dbUser) {
			return createErrorResponse(
				{
					code: 'USER_NOT_FOUND',
					message: 'User not found',
				},
				404
			);
		}

		let permissionsMap: Record<string, Record<string, boolean>> = {};

		if (dbUser.isAdmin) {
			// Admin has full permissions
			if (body.teamId) {
				permissionsMap[body.teamId] = { '*': true };
			} else {
				permissionsMap = Object.fromEntries(
					body.teamIds!.map((id: string) => [id, { '*': true }])
				);
			}
		} else {
			// Regular user - fetch their permissions
			if (body.teamId) {
				permissionsMap[body.teamId] = await getUserPermissions(
					user.id,
					body.teamId
				);
			} else {
				// Fetch permissions for all requested teams in parallel
				const permissionsPromises = body.teamIds!.map(
					async (teamId: string) => {
						const permissions = await getUserPermissions(
							user.id,
							teamId
						);
						return [teamId, permissions] as const;
					}
				);

				const results = await Promise.all(permissionsPromises);
				permissionsMap = Object.fromEntries(results);
			}
		}

		return createSuccessResponse({ permissions: permissionsMap });
	} catch (error) {
		console.error('Error fetching permissions:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to fetch permissions',
			},
			500
		);
	}
}
