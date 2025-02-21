'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabaseClient';
import axios from 'axios';

export default function InvitePage() {
	const { token } = useParams();
	const router = useRouter();
	const { toast } = useToast();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [inviteStatus, setInviteStatus] = useState<string | null>(null);

	useEffect(() => {
		if (!token) {
			setInviteStatus('Invalid invite token');
		}
	}, [token]);

	const handleAcceptInvite = async () => {
		const supabase = await createClient();
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();

		if (error || !user) {
			toast({
				title: 'Authentication Required',
				description: 'Please sign in to accept the invite.',
				variant: 'destructive',
			});
			return;
		}

		setIsSubmitting(true);

		try {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const res = await axios.post('/api/teams/invite/accept', {
				token,
				userId: user.id,
			});

			toast({
				title: 'Invite Accepted',
				description: 'You have successfully joined the team',
			});

			setInviteStatus('Invite accepted. Redirecting...');

			setTimeout(() => {
				router.push('/');
			}, 2000);
		} catch (error) {
			console.error('Error accepting invite:', error);
			toast({
				title: 'Error',
				description: 'Failed to accept invite.',
				variant: 'destructive',
			});
			setInviteStatus('Failed to accept invite.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-6">
			<h1 className="text-3xl font-bold mb-4">Join the team</h1>
			{inviteStatus && (
				<p className="mb-4 text-red-500">{inviteStatus}</p>
			)}

			{!inviteStatus && (
				<div className="w-full max-w-md">
					<Button
						className="w-full"
						onClick={handleAcceptInvite}
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Joining...' : 'Join Team'}
					</Button>
				</div>
			)}
		</div>
	);
}
