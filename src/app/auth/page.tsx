// src/app/auth/page.tsx
import AuthForm from './AuthForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Authentication | Miniverse Project Manager',
	description:
		'Login or sign up to access your project management dashboard.',
};

interface AuthPageProps {
	searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
	const resolvedSearchParams = await searchParams;

	// Validate redirect path to prevent open redirect vulnerabilities
	const redirectPath = resolvedSearchParams.redirect?.startsWith('/')
		? resolvedSearchParams.redirect
		: '/';

	return <AuthForm redirectPath={redirectPath} />;
}
