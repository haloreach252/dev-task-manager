'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { z } from 'zod';
import { headers } from 'next/headers';

// Input validation schemas
const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signupSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
		.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
		.regex(/[0-9]/, 'Password must contain at least one number')
		.regex(
			/[^A-Za-z0-9]/,
			'Password must contain at least one special character'
		),
});

const otpSchema = z.object({
	email: z.string().email('Invalid email address'),
});

// Rate limiting helper
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

const rateLimit = new Map<string, { attempts: number; timestamp: number }>();

function checkRateLimit(identifier: string): boolean {
	const now = Date.now();
	const userAttempts = rateLimit.get(identifier);

	if (!userAttempts) {
		rateLimit.set(identifier, { attempts: 1, timestamp: now });
		return true;
	}

	if (now - userAttempts.timestamp > RATE_LIMIT_WINDOW) {
		rateLimit.set(identifier, { attempts: 1, timestamp: now });
		return true;
	}

	if (userAttempts.attempts >= MAX_ATTEMPTS) {
		return false;
	}

	userAttempts.attempts += 1;
	return true;
}

// Get client IP for rate limiting
async function getClientIP(): Promise<string> {
	const headersList = await headers();
	const forwardedFor = headersList.get('x-forwarded-for');
	return forwardedFor?.split(',')[0] || 'unknown';
}

export async function login(formData: FormData) {
	const supabase = await createClient();
	const clientIP = await getClientIP();

	if (!checkRateLimit(clientIP)) {
		throw new Error('Too many login attempts. Please try again later.');
	}

	try {
		const data = {
			email: formData.get('email') as string,
			password: formData.get('password') as string,
		};

		// Validate input
		const validatedData = loginSchema.parse(data);

		const { error } = await supabase.auth.signInWithPassword(validatedData);

		if (error) {
			if (error.message === 'Email not confirmed') {
				redirect('/auth/confirm-email');
			}
			throw error;
		}

		revalidatePath('/', 'layout');
		redirect('/');
	} catch (error) {
		if (error instanceof z.ZodError) {
			throw new Error(error.errors[0].message);
		}
		throw error;
	}
}

export async function signup(formData: FormData) {
	const supabase = await createClient();
	const clientIP = await getClientIP();

	if (!checkRateLimit(clientIP)) {
		throw new Error('Too many signup attempts. Please try again later.');
	}

	try {
		const data = {
			email: formData.get('email') as string,
			password: formData.get('password') as string,
		};

		// Validate input
		const validatedData = signupSchema.parse(data);

		const { error } = await supabase.auth.signUp(validatedData);

		if (error) {
			throw error;
		}

		// In the future, redirect the user to the page to check their email to confirm
		revalidatePath('/', 'layout');
		redirect('/');
	} catch (error) {
		if (error instanceof z.ZodError) {
			throw new Error(error.errors[0].message);
		}
		throw error;
	}
}

export async function loginWithOAuth(
	provider: 'github' | 'discord',
	redirectPath: string
) {
	const supabase = await createClient();
	const clientIP = await getClientIP();

	if (!checkRateLimit(clientIP)) {
		throw new Error('Too many OAuth attempts. Please try again later.');
	}

	try {
		// Validate redirect path to prevent open redirect vulnerabilities
		const safeRedirectPath = redirectPath.startsWith('/')
			? redirectPath
			: '/';
		const redirectTo = `${
			process.env.NEXT_PUBLIC_SITE_URL
		}/api/auth/callback?redirect=${encodeURIComponent(safeRedirectPath)}`;

		console.log('Attempting OAuth login with:', {
			provider,
			redirectTo,
			siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
		});

		const { data, error } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo,
				queryParams: {
					access_type: 'offline',
					prompt: 'consent',
				},
			},
		});

		if (error) {
			console.error('OAuth error:', error);
			throw error;
		}

		if (!data?.url) {
			console.error('No URL returned from OAuth');
			throw new Error('Failed to get OAuth URL');
		}

		console.log('OAuth URL generated successfully:', data.url);
		return data.url;
	} catch (error) {
		console.error('OAuth login error:', error);
		throw error;
	}
}

export async function loginWithOtp(formData: FormData) {
	const supabase = await createClient();
	const clientIP = await getClientIP();

	if (!checkRateLimit(clientIP)) {
		throw new Error('Too many OTP attempts. Please try again later.');
	}

	try {
		const data = {
			email: formData.get('email') as string,
		};

		// Validate input
		const validatedData = otpSchema.parse(data);

		const { error } = await supabase.auth.signInWithOtp(validatedData);

		if (error) {
			throw error;
		}

		revalidatePath('/', 'layout');
		redirect('/');
	} catch (error) {
		if (error instanceof z.ZodError) {
			throw new Error(error.errors[0].message);
		}
		throw error;
	}
}

export async function signout() {
	const supabase = await createClient();

	try {
		const { error } = await supabase.auth.signOut();
		if (error) {
			throw error;
		}
	} catch (error) {
		throw error;
	}
}
