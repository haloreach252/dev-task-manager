'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase';

export async function login(formData: FormData) {
	const supabase = await createClient();

	// type-casting here for convenience
	// in practice, you should validate your inputs
	const data = {
		email: formData.get('email') as string,
		password: formData.get('password') as string,
	};

	const { error } = await supabase.auth.signInWithPassword(data);

	if (error) {
		if (error.message === 'Email not confirmed') {
			redirect('/auth/confirm-email');
		}

		console.log('User Login with email error: ', error);
		console.log('Message only: ', error.message);
		redirect('/error');
	}

	revalidatePath('/', 'layout');
	redirect('/');
}

export async function signup(formData: FormData) {
	const supabase = await createClient();

	const data = {
		email: formData.get('email') as string,
		password: formData.get('password') as string,
	};

	const { error } = await supabase.auth.signUp(data);

	if (error) {
		redirect('/error');
	}

	// TODO: In the future, redirect the user to the page to check their email to confirm
	revalidatePath('/', 'layout');
	redirect('/');
}

export async function loginWithOAuth(
	provider: 'github' | 'discord',
	redirectPath: string
) {
	const supabase = await createClient();

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo: `${
				process.env.NEXT_PUBLIC_SITE_URL
			}/api/auth/callback?redirect=${encodeURIComponent(redirectPath)}`,
		},
	});

	if (error) {
		console.log('OAuth login error:', error);
		return null;
		//redirect('/error');
	}

	return data?.url;
	/*
    revalidatePath('/', 'layout');
    redirect('/');*/
}

export async function loginWithOtp(formData: FormData) {
	const supabase = await createClient();

	const email = formData.get('email') as string;

	const { error } = await supabase.auth.signInWithOtp({ email });

	if (error) {
		redirect('/error');
	}

	revalidatePath('/', 'layout');
	redirect('/');
}

export async function signout() {
	const supabase = await createClient();

	await supabase.auth.signOut();
}
