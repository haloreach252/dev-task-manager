import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';

export async function GET() {
	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		console.error('USER/PROFILE GET ERROR: ', error);
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Fetch user data from the user table (not auth user)
	const userProfile = await prisma.user.findUnique({
		where: { id: user.id },
	});

	if (!userProfile) {
		return NextResponse.json(
			{ error: 'User profile not found' },
			{ status: 404 }
		);
	}

	return NextResponse.json(userProfile);
}

export async function PUT(request: Request) {
	const supabase = await createClient();

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		console.error('USER/PROFILE PUT ERROR: ', error);
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await request.json();
	const { name } = body;

	try {
		const updatedUser = await prisma.user.update({
			where: { id: user.id },
			data: {
				name,
			},
		});

		return NextResponse.json(updatedUser);
	} catch (err) {
		console.error('Error updating profile: ', err);
		return NextResponse.json(
			{ error: 'Failed to update profile' },
			{ status: 500 }
		);
	}
}
