/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/teams/[teamId]/management/InviteDialog.tsx

'use client';

import { useState, useCallback, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

interface TeamRole {
	id: string;
	name: string;
}

interface InviteDialogProps {
	teamId: string;
	setMembers: (members: TeamMember[]) => void;
}

interface TeamMember {
	id: string;
	email: string;
	role: TeamRole;
}

export default function InviteDialog({
	teamId,
	setMembers,
}: InviteDialogProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [inviteEmail, setInviteEmail] = useState('');
	const [roleId, setRoleId] = useState<string | null>(null);
	const [inviteLink, setInviteLink] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [emailError, setEmailError] = useState('');
	const { toast } = useToast();
	const { hasPermission } = usePermissions(teamId);

	// Check if user has permission to invite members
	useEffect(() => {
		if (!hasPermission(teamId, 'inviteMembers')) {
			setIsDialogOpen(false);
			toast({
				title: 'Permission Denied',
				description: 'You do not have permission to invite members.',
				variant: 'destructive',
			});
		}
	}, [teamId, hasPermission, toast]);

	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email) {
			setEmailError('Email is required');
			return false;
		}
		if (!emailRegex.test(email)) {
			setEmailError('Please enter a valid email address');
			return false;
		}
		setEmailError('');
		return true;
	};

	const handleInvite = async () => {
		if (!validateEmail(inviteEmail)) return;
		if (!hasPermission(teamId, 'inviteMembers')) {
			toast({
				title: 'Permission Denied',
				description: 'You do not have permission to invite members.',
				variant: 'destructive',
			});
			return;
		}

		setIsLoading(true);
		try {
			const res = await axios.post(`/api/teams/${teamId}/invite`, {
				email: inviteEmail,
				roleId,
			});
			setInviteLink(res.data.inviteLink);
			setInviteEmail('');
			setEmailError('');

			toast({
				title: 'Invite Sent',
				description: `An invitation has been sent to ${inviteEmail}`,
			});

			// Refresh members list
			const membersRes = await axios.get(`/api/teams/${teamId}/members`);
			setMembers(membersRes.data.members);
		} catch (error) {
			const axiosError = error as AxiosError<{ message: string }>;
			const errorMessage =
				axiosError.response?.data?.message || 'Failed to send invite.';
			toast({
				title: 'Error',
				description: errorMessage,
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCopyLink = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(inviteLink);
			toast({
				title: 'Link Copied',
				description:
					'The invite link has been copied to your clipboard.',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to copy invite link.',
				variant: 'destructive',
			});
		}
	}, [inviteLink, toast]);

	const handleDialogClose = useCallback(() => {
		if (inviteEmail && !isLoading) {
			const confirmed = window.confirm(
				'Are you sure you want to close? Any unsaved changes will be lost.'
			);
			if (!confirmed) return;
		}
		setIsDialogOpen(false);
		setInviteEmail('');
		setEmailError('');
		setInviteLink('');
	}, [inviteEmail, isLoading]);

	// Fetch roles - only if user has manageMembers permission
	const {
		data: roles,
		isLoading: rolesLoading,
		isError: rolesError,
	} = useQuery({
		queryKey: ['teamRoles', teamId],
		queryFn: async () => {
			if (!hasPermission(teamId, 'manageMembers')) {
				return [];
			}
			const res = await axios.get(`/api/teams/${teamId}/roles`);
			return res.data.roles as TeamRole[];
		},
		enabled: hasPermission(teamId, 'manageMembers'), // Only fetch if user has permission
	});

	if (!hasPermission(teamId, 'inviteMembers')) {
		return null;
	}

	return (
		<>
			<Button className="mt-6" onClick={() => setIsDialogOpen(true)}>
				Invite New Member
			</Button>

			<Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Invite New Member</DialogTitle>
					</DialogHeader>

					<div className="space-y-4">
						<div className="space-y-2">
							<Input
								type="email"
								placeholder="User email"
								value={inviteEmail}
								onChange={(e) => {
									setInviteEmail(e.target.value);
									if (emailError)
										validateEmail(e.target.value);
								}}
								onBlur={() => validateEmail(inviteEmail)}
								aria-label="Email address"
								aria-invalid={!!emailError}
								autoFocus
							/>
							{emailError && (
								<p className="text-sm text-red-500">
									{emailError}
								</p>
							)}
						</div>

						{hasPermission(teamId, 'manageMembers') &&
							roles &&
							roles.length > 0 && (
								<Select
									onValueChange={(newRoleId) =>
										setRoleId(newRoleId)
									}
									disabled={rolesLoading}
								>
									<SelectTrigger>
										<SelectValue
											placeholder={
												rolesLoading
													? 'Loading roles...'
													: 'Select Role'
											}
										/>
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
										aria-label="Invite link"
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
					</div>

					<DialogFooter>
						<Button
							onClick={handleInvite}
							disabled={isLoading || !inviteEmail || !!emailError}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Sending...
								</>
							) : (
								'Send Invite'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
