// src/app/auth/OAuthButtons.tsx

'use client';

import { loginWithOAuth } from './actions';
import { Button } from '@/components/ui/button';
import { FaGithub, FaDiscord } from 'react-icons/fa';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type OAuthProvider = 'github' | 'discord';

export default function OAuthButtons({
	redirectPath,
}: {
	redirectPath: string;
}): React.ReactNode {
	const [isLoading, setIsLoading] = useState<OAuthProvider | null>(null);
	const { toast } = useToast();

	const handleOAuthLogin = async (provider: OAuthProvider) => {
		try {
			setIsLoading(provider);
			console.log('Starting OAuth login process for:', provider);

			const url = await loginWithOAuth(provider, redirectPath);

			if (!url) {
				throw new Error('No URL returned from OAuth login');
			}

			console.log('Redirecting to OAuth URL:', url);
			window.location.href = url;
		} catch (err) {
			console.error('OAuth login error:', err);
			toast({
				title: 'Error',
				description: `Failed to login with ${provider}. Please try again.`,
				variant: 'destructive',
			});
		} finally {
			setIsLoading(null);
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<Button
				variant="outline"
				onClick={() => handleOAuthLogin('github')}
				className="flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
				disabled={isLoading !== null}
				aria-label="Continue with GitHub"
			>
				<FaGithub size={18} />
				{isLoading === 'github'
					? 'Connecting...'
					: 'Continue with GitHub'}
			</Button>

			<Button
				variant="outline"
				onClick={() => handleOAuthLogin('discord')}
				className="flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
				disabled={isLoading !== null}
				aria-label="Continue with Discord"
			>
				<FaDiscord size={18} />
				{isLoading === 'discord'
					? 'Connecting...'
					: 'Continue with Discord'}
			</Button>
		</div>
	);
}
