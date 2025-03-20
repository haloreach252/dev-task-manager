// src/app/api/user/profile/route.ts

import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { validateUpdateProfile } from '../types';
import { createErrorResponse, createSuccessResponse } from '../utils';

export async function GET() {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();

		if (error || !user) {
			console.error('USER/PROFILE GET ERROR:', error);
			return createErrorResponse(
				{
					code: 'UNAUTHORIZED',
					message: 'Unauthorized',
				},
				401
			);
		}

		// Fetch user data from the user table (not auth user)
		const userProfile = await prisma.user.findUnique({
			where: { id: user.id },
		});

		if (!userProfile) {
			return createErrorResponse(
				{
					code: 'NOT_FOUND',
					message: 'User profile not found',
				},
				404
			);
		}

		return createSuccessResponse(userProfile);
	} catch (error) {
		console.error('Unexpected error in profile GET:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'An unexpected error occurred',
			},
			500
		);
	}
}

export async function PUT(request: Request) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();

		if (error || !user) {
			console.error('USER/PROFILE PUT ERROR:', error);
			return createErrorResponse(
				{
					code: 'UNAUTHORIZED',
					message: 'Unauthorized',
				},
				401
			);
		}

		const body = await request.json();

		// Validate input
		const validationError = validateUpdateProfile(body);
		if (validationError) {
			return createErrorResponse(validationError);
		}

		const updatedUser = await prisma.user.update({
			where: { id: user.id },
			data: {
				name: body.name,
			},
		});

		return createSuccessResponse(updatedUser);
	} catch (error) {
		console.error('Error updating profile:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'Failed to update profile',
			},
			500
		);
	}
}
