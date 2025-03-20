import { type EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase';
import { validateAuthConfirmParams } from '../types';
import { createErrorResponse, createRedirectResponse } from '../utils';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const token_hash = searchParams.get('token_hash');
		const type = searchParams.get('type') as EmailOtpType | null;
		const next = searchParams.get('next') ?? '/';

		// Validate input parameters
		const validationError = validateAuthConfirmParams({
			token_hash,
			type,
			next,
		});
		if (validationError) {
			console.error('Auth confirm validation error:', validationError);
			return createErrorResponse(validationError);
		}

		const supabase = await createClient();

		const { error } = await supabase.auth.verifyOtp({
			type: type!,
			token_hash: token_hash!,
		});

		if (error) {
			console.error('OTP verification error:', error);
			return createErrorResponse(
				{
					code: 'VERIFICATION_ERROR',
					message: error.message,
				},
				401
			);
		}

		return createRedirectResponse(
			`${process.env.NEXT_PUBLIC_SITE_URL}${next}`
		);
	} catch (error) {
		console.error('Unexpected error in auth confirm:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'An unexpected error occurred',
			},
			500
		);
	}
}
