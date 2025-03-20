import { createClient } from '@/lib/supabase';
import { validateAuthCallbackParams } from '../types';
import { createErrorResponse, createRedirectResponse } from '../utils';

export async function GET(request: Request) {
	try {
		const supabase = await createClient();
		const { searchParams } = new URL(request.url);
		const code = searchParams.get('code');
		const redirectPath = searchParams.get('redirect') || '/';

		// Validate input parameters
		const validationError = validateAuthCallbackParams({
			code,
			redirectPath,
		});
		if (validationError) {
			console.error('Auth callback validation error:', validationError);
			return createErrorResponse(validationError);
		}

		// Exchange the OAuth code for a supabase session
		const { error } = await supabase.auth.exchangeCodeForSession(code!);

		if (error) {
			console.error('OAuth callback error:', error);
			return createErrorResponse(
				{
					code: 'AUTH_ERROR',
					message: error.message,
				},
				401
			);
		}

		// Redirect the user to the original page or default to '/'
		return createRedirectResponse(
			`${process.env.NEXT_PUBLIC_SITE_URL}${redirectPath}`
		);
	} catch (error) {
		console.error('Unexpected error in auth callback:', error);
		return createErrorResponse(
			{
				code: 'INTERNAL_ERROR',
				message: 'An unexpected error occurred',
			},
			500
		);
	}
}
