import { type EmailOtpType } from '@supabase/supabase-js';

export type AuthError = {
	code: string;
	message: string;
};

export type AuthResponse = {
	success: boolean;
	error?: AuthError;
};

export type AuthCallbackParams = {
	code: string | null;
	redirectPath: string;
};

export type AuthConfirmParams = {
	token_hash: string | null;
	type: EmailOtpType | null;
	next: string;
};

export const validateAuthCallbackParams = (
	params: AuthCallbackParams
): AuthError | null => {
	if (!params.code) {
		return {
			code: 'MISSING_CODE',
			message: 'Authorization code is required',
		};
	}
	return null;
};

export const validateAuthConfirmParams = (
	params: AuthConfirmParams
): AuthError | null => {
	if (!params.token_hash || !params.type) {
		return {
			code: 'MISSING_PARAMS',
			message: 'Token hash and type are required',
		};
	}
	return null;
};
