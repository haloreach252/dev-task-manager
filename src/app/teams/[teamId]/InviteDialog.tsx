/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/teams/[teamId]/management/InviteDialog.tsx

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
import { usePermissions } from '@/hooks/usePermissions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';

type TeamRole = {
	id: string;
	name: string;
}

export default function InviteDialog(props: {
	teamId: string;
	setMembers: (arg0: any) => void;
}) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [inviteEmail, setInviteEmail] = useState('');
	const [roleId, setRoleId] = useState<string | null>(null);
	const [inviteLink, setInviteLink] = useState('');
	const { toast } = useToast();
	const { hasPermission } = usePermissions(props.teamId);

	const handleInvite = async () => {
		if (!inviteEmail) return;

		try {
			const res = await axios.post(`/api/teams/${props.teamId}/invite`, {
				email: inviteEmail,
				roleId,
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

	// Fetch roles
	const {
		data: roles,
		isLoading: rolesLoading,
		isError: rolesError = false, // Prevents undefined variable error
	} = useQuery({
		queryKey: ['teamRoles', props.teamId],
		queryFn: async () => {
			const res = await axios.get(`/api/teams/${props.teamId}/roles`);
			return res.data.roles as TeamRole[];
		},
	});

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

					{/* Role Selector - Only show if user can manage team */}
					{hasPermission(props.teamId, 'manageMembers') && (
						<Select
							onValueChange={(newRoleId) =>
								setRoleId(newRoleId)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select Role" />
							</SelectTrigger>
							<SelectContent>
								{roles?.map((role) => (
									<SelectItem
										key={role.id}
										value={role.id}
									>
										{role.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}

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
