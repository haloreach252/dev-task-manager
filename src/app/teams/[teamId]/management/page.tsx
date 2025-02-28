'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import InviteDialog from './InviteDialog';
import { type TeamMember } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

type TeamRole = {
	id: string;
	name: string;
};

type Team = {
	id: string;
	name: string;
	permissions: string[];
	canManageTeam: boolean;
};

export default function TeamManagement() {
	const params = useParams();
	const teamId = params.teamId as string;
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Fetch team data
	const {
		data: team,
		isLoading: teamLoading,
		isError: teamError,
	} = useQuery({
		queryKey: ['team', teamId],
		queryFn: async () => {
			const res = await axios.get(`/api/teams/${teamId}`);
			return res.data.team as Team;
		},
	});

	// Fetch members
	const {
		data: members,
		isLoading: membersLoading,
		isError: membersError,
	} = useQuery({
		queryKey: ['teamMembers', teamId],
		queryFn: async () => {
			const res = await axios.get(`/api/teams/${teamId}/members`);
			return res.data.members as TeamMember[];
		},
	});

	// Fetch roles
	const {
		data: roles,
		isLoading: rolesLoading,
		isError: rolesError = false, // Prevents undefined variable error
	} = useQuery({
		queryKey: ['teamRoles', teamId],
		queryFn: async () => {
			const res = await axios.get(`/api/teams/${teamId}/roles`);
			return res.data.roles as TeamRole[];
		},
	});

	// Mutation for updating member roles
	const roleMutation = useMutation({
		mutationFn: async ({
			memberId,
			roleId,
		}: {
			memberId: string;
			roleId: string;
		}) => {
			await axios.patch(`/api/teams/${teamId}/members`, {
				memberId,
				teamRoleId: roleId,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['teamMembers', teamId],
			});
			toast({
				title: 'Role Updated',
				description: 'Member role has been updated',
			});
		},
		onError: () => {
			toast({
				title: 'Error',
				description: 'Failed to update role.',
				variant: 'destructive',
			});
		},
	});

	// Mutation for removing a member
	const removeMutation = useMutation({
		mutationFn: async (memberId: string) => {
			await axios.delete(`/api/teams/${teamId}/members`, {
				data: { memberId },
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['teamMembers', teamId],
			});
			toast({
				title: 'Member Removed',
				description: 'The member has been removed from the team.',
			});
		},
		onError: () => {
			toast({
				title: 'Error',
				description: 'Failed to remove member.',
				variant: 'destructive',
			});
		},
	});

	// Function to update members after an invite
	const updateMembers = async () => {
		queryClient.invalidateQueries({
			queryKey: ['teamMembers', teamId],
		});
	};

	if (teamLoading || membersLoading || rolesLoading) {
		return (
			<div className="p-8">
				<h1 className="text-3xl font-bold mb-6">Team Management</h1>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{[...Array(3)].map((_, i) => (
						<Skeleton key={i} className="h-24 w-full bg-gray-700" />
					))}
				</div>
			</div>
		);
	}

	if (teamError || membersError || rolesError) {
		return (
			<div className="p-8">
				<h1 className="text-3xl font-bold mb-6">Team Management</h1>
				<p className="text-red-500">
					Failed to load team data. Please try again.
				</p>
			</div>
		);
	}

	const canManageTeam =
		team?.permissions?.includes('*') ||
		team?.permissions?.includes('manageMembers');

	return (
		<div className="p-8">
			<h1 className="text-3xl font-bold mb-6">
				{team?.name} - Team Management
			</h1>

			{/* Members List */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{members?.map((member) => (
					<Card key={member.id}>
						<CardHeader>
							<CardTitle>
								{member.user.name || member.user.email}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-gray-600">
								Email: {member.user.email}
							</p>

							{/* Role Selector - Only show if user can manage team */}
							{canManageTeam && (
								<Select
									value={member.teamRole.id}
									onValueChange={(newRoleId) =>
										roleMutation.mutate({
											memberId: member.id,
											roleId: newRoleId,
										})
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

							{/* Remove Member Button - Only show if user can manage team */}
							{canManageTeam && (
								<Button
									variant="destructive"
									className="mt-4"
									onClick={() =>
										removeMutation.mutate(member.id)
									}
								>
									Remove Member
								</Button>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			{/* Invite Dialog - Only show if user can manage team */}
			{canManageTeam && (
				<InviteDialog teamId={teamId} setMembers={updateMembers} />
			)}
		</div>
	);
}
