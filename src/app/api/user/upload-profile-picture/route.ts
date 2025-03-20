// src/app/api/user/upload-profile-picture/route.ts

/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { createErrorResponse, createSuccessResponse } from '../utils';

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
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

		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return createErrorResponse({
				code: 'MISSING_FILE',
				message: 'No file uploaded',
			});
		}

		// Validate file type
		if (!ALLOWED_FILE_TYPES.includes(file.type)) {
			return createErrorResponse({
				code: 'INVALID_FILE_TYPE',
				message:
					'Invalid file type. Only JPEG, PNG, and GIF files are allowed.',
			});
		}

		// Validate file size
		if (file.size > MAX_FILE_SIZE) {
			return createErrorResponse({
				code: 'FILE_TOO_LARGE',
				message: 'File size exceeds 5MB limit',
			});
		}

		const fileExt = file.name.split('.').pop();
		const filePath = `${user.id}.${fileExt}`;

		// Upload to supabase storage
		const { data: storageData, error: uploadError } = await supabase.storage
			.from('profile-pictures')
			.upload(filePath, file, {
				upsert: true,
				headers: {
					Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
				},
			});

		if (uploadError) {
			console.error('Upload error:', uploadError);
			return createErrorResponse(
				{
					code: 'UPLOAD_ERROR',
					message: 'Failed to upload file',
				},
				500
			);
		}

		// Get the public URL
		const { data: publicUrlData } = supabase.storage
			.from('profile-pictures')
			.getPublicUrl(filePath);

		// Update user's profilePicture in Prisma
		const updatedUser = await prisma.user.update({
			where: { id: user.id },
			data: { profilePicture: publicUrlData.publicUrl },
		});

		return createSuccessResponse({
			profilePicture: publicUrlData.publicUrl,
			user: updatedUser,
		});
	} catch (error) {
		console.error('Unexpected error in profile picture upload:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'An unexpected error occurred',
			},
			500
		);
	}
}
