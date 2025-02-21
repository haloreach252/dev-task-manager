'use client';

import { useState } from 'react';
import axios from 'axios';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { type TeamMember } from '@/lib/types';

export default function InviteDialog(props: {
	teamId: string;
	setMembers: (arg0: TeamMember[]) => void;
}) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [inviteEmail, setInviteEmail] = useState('');
	const [inviteLink, setInviteLink] = useState('');
	const { toast } = useToast();

	const handleInvite = async () => {
		if (!inviteEmail) return;

		try {
			const res = await axios.post(`/api/teams/${props.teamId}/invite`, {
				email: inviteEmail,
			});
			setInviteLink(res.data.inviteLink);
			setInviteEmail('');

			toast({
				title: 'Invite Sent',
				description: `An invitation has been sent to ${inviteEmail}`,
			});

			// Refresh members list
			const membersRes = await axios.get(
				`/api/teams/${props.teamId}/members`
			);
			props.setMembers(membersRes.data.members);
		} catch (error) {
			console.error(error);
			toast({
				title: 'Error',
				description: 'Failed to send invite.',
				variant: 'destructive',
			});
		}
	};

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(inviteLink);
			toast({
				title: 'Link Copied',
				description:
					'The invite link has been copied to your clipboard.',
			});
		} catch (error) {
			console.error('Failed to copy link:', error);
			toast({
				title: 'Error',
				description: 'Failed to copy invite link.',
				variant: 'destructive',
			});
		}
	};

	return (
		<>
			<Button className="mt-6" onClick={() => setIsDialogOpen(true)}>
				Invite New Member
			</Button>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Invite New Member</DialogTitle>
					</DialogHeader>

					<Input
						type="email"
						placeholder="User email"
						value={inviteEmail}
						onChange={(e) => setInviteEmail(e.target.value)}
					/>

					{inviteLink && (
						<div className="mt-4">
							<p className="text-sm">Invite Link:</p>
							<div className="flex items-center gap-2">
								<Input
									readOnly
									value={inviteLink}
									className="w-full"
								/>
								<Button
									variant="secondary"
									onClick={handleCopyLink}
								>
									Copy
								</Button>
							</div>
						</div>
					)}

					<DialogFooter>
						<Button onClick={handleInvite} disabled={!inviteEmail}>
							Send Invite
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
