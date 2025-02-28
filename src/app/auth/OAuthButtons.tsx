// src/app/auth/OAuthButtons.tsx

'use client';

import { loginWithOAuth } from './actions';
import { Button } from '@/components/ui/button';
import { FaGithub, FaDiscord } from 'react-icons/fa';

type OAuthProvider = 'github' | 'discord';

export default function OAuthButtons({
	redirectPath,
}: {
	redirectPath: string;
}) {
	const handleOAuthLogin = async (provider: OAuthProvider) => {
		const url = await loginWithOAuth(provider, redirectPath);

		if (url) {
			window.location.href = url; // Redirect to oauth provider
		} else {
			console.error('OAuth login failed.');
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<Button
				variant="outline"
				onClick={() => handleOAuthLogin('github')}
				className="flex items-center justify-center gap-2"
			>
				<FaGithub size={18} />
				Continue with GitHub
			</Button>

			<Button
				variant="outline"
				onClick={() => handleOAuthLogin('discord')}
				className="flex items-center justify-center gap-2"
			>
				<FaDiscord size={18} />
				Continue with Discord
			</Button>
		</div>
	);
}
