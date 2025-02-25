/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const formData = await request.formData();
	const file = formData.get('file') as File;

	if (!file) {
		return NextResponse.json(
			{ error: 'No file uploaded' },
			{ status: 400 }
		);
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
		return NextResponse.json(
			{ error: 'Failed to upload' },
			{ status: 500 }
		);
	}

	// Get the public URL
	const { data: publicUrlData } = supabase.storage
		.from('profile-pictures')
		.getPublicUrl(filePath);

	// Update user's profilePicture in Prisma
	await prisma.user.update({
		where: { id: user.id },
		data: { profilePicture: publicUrlData.publicUrl },
	});

	return NextResponse.json({ profilePicture: publicUrlData.publicUrl });
}
