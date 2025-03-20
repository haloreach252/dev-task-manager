'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import InviteDialog from '../InviteDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { usePermissions } from '@/hooks/usePermissions';
import Link from 'next/link';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { Shield, Users, Settings, AlertTriangle } from 'lucide-react';

interface TeamRole {
	id: string;
	name: string;
}

interface Team {
	id: string;
	name: string;
	permissions: string[];
	canManageTeam: boolean;
}

interface TeamMember {
	id: string;
	user: { id: string; name?: string; email: string };
	teamRole: TeamRole;
}

interface ErrorResponse {
	code: string;
	message: string;
}

interface ApiResponse<T> {
	success: boolean;
	data: T;
	error?: ErrorResponse;
}

interface TeamResponse {
	team: Team;
}

interface MembersResponse {
	members: TeamMember[];
}

interface RolesResponse {
	roles: TeamRole[];
}

interface UpdateRoleResponse {
	success: boolean;
}

interface RemoveMemberResponse {
	success: boolean;
}

export default function TeamManagement() {
	const params = useParams();
	const teamId = params.teamId as string;
	const { toast } = useToast();
	const { hasPermission } = usePermissions(teamId);
	const queryClient = useQueryClient();
	const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(
		null
	);

	// Fetch team data
	const {
		data: team,
		isLoading: teamLoading,
		isError: teamError,
		error: teamErrorData,
	} = useQuery({
		queryKey: ['team', teamId],
		queryFn: async () => {
			try {
				const res = await axios.get<ApiResponse<TeamResponse>>(
					`/api/teams/${teamId}`
				);
				if (!res.data.success) {
					throw new Error(
						res.data.error?.message || 'Failed to fetch team data'
					);
				}
				return res.data.data.team;
			} catch (err) {
				const error = err as AxiosError<ApiResponse<TeamResponse>>;
				throw new Error(
					error.response?.data?.error?.message ||
						error.message ||
						'Failed to fetch team data'
				);
			}
		},
	});

	// Fetch members
	const {
		data: members,
		isLoading: membersLoading,
		isError: membersError,
		error: membersErrorData,
	} = useQuery({
		queryKey: ['teamMembers', teamId],
		queryFn: async () => {
			try {
				const res = await axios.get<ApiResponse<MembersResponse>>(
					`/api/teams/${teamId}/members`
				);
				if (!res.data.success) {
					throw new Error(
						res.data.error?.message ||
							'Failed to fetch team members'
					);
				}
				return res.data.data.members;
			} catch (err) {
				const error = err as AxiosError<ApiResponse<MembersResponse>>;
				throw new Error(
					error.response?.data?.error?.message ||
						error.message ||
						'Failed to fetch team members'
				);
			}
		},
	});

	// Fetch roles
	const {
		data: roles,
		isLoading: rolesLoading,
		isError: rolesError,
		error: rolesErrorData,
	} = useQuery({
		queryKey: ['teamRoles', teamId],
		queryFn: async () => {
			try {
				const res = await axios.get<ApiResponse<RolesResponse>>(
					`/api/teams/${teamId}/roles`
				);
				if (!res.data.success) {
					throw new Error(
						res.data.error?.message || 'Failed to fetch team roles'
					);
				}
				return res.data.data.roles;
			} catch (err) {
				const error = err as AxiosError<ApiResponse<RolesResponse>>;
				throw new Error(
					error.response?.data?.error?.message ||
						error.message ||
						'Failed to fetch team roles'
				);
			}
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
			const res = await axios.patch<ApiResponse<UpdateRoleResponse>>(
				`/api/teams/${teamId}/members`,
				{
					memberId,
					teamRoleId: roleId,
				}
			);
			if (!res.data.success) {
				throw new Error(
					res.data.error?.message || 'Failed to update role'
				);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['teamMembers', teamId],
			});
			toast({
				title: 'Role Updated',
				description: 'Member role has been updated successfully.',
			});
		},
		onError: (error: Error) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to update role.',
				variant: 'destructive',
			});
		},
	});

	// Mutation for removing a member
	const removeMutation = useMutation({
		mutationFn: async (memberId: string) => {
			const res = await axios.delete<ApiResponse<RemoveMemberResponse>>(
				`/api/teams/${teamId}/members`,
				{
					data: { memberId },
				}
			);
			if (!res.data.success) {
				throw new Error(
					res.data.error?.message || 'Failed to remove member'
				);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['teamMembers', teamId],
			});
			toast({
				title: 'Member Removed',
				description: 'The member has been removed from the team.',
			});
			setMemberToRemove(null);
		},
		onError: (error: Error) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to remove member.',
				variant: 'destructive',
			});
			setMemberToRemove(null);
		},
	});

	// Function to update members after an invite
	const updateMembers = () => {
		queryClient.invalidateQueries({
			queryKey: ['teamMembers', teamId],
		});
	};

	// Update queryClient invalidation
	const handleRetry = () => {
		queryClient.invalidateQueries({ queryKey: ['team', teamId] });
		queryClient.invalidateQueries({ queryKey: ['teamMembers', teamId] });
		queryClient.invalidateQueries({ queryKey: ['teamRoles', teamId] });
	};

	if (teamLoading || membersLoading || rolesLoading) {
		return (
			<div className="p-8 space-y-6">
				<div className="flex items-center space-x-4">
					<Skeleton className="h-8 w-8" />
					<Skeleton className="h-10 w-64" />
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{[...Array(6)].map((_, i) => (
						<Skeleton
							key={i}
							className="h-[200px] w-full rounded-lg"
						/>
					))}
				</div>
			</div>
		);
	}

	if (teamError || membersError || rolesError) {
		return (
			<div className="p-8 space-y-4">
				<h1 className="text-3xl font-bold">Team Management</h1>
				<div className="bg-red-500/10 border border-red-500 rounded-lg p-4 space-y-2">
					<div className="flex items-center space-x-2">
						<AlertTriangle className="h-5 w-5 text-red-500" />
						<p className="font-semibold text-red-500">
							Error Loading Data
						</p>
					</div>
					<p className="text-sm text-red-500">
						{(teamErrorData as Error)?.message ||
							(membersErrorData as Error)?.message ||
							(rolesErrorData as Error)?.message ||
							'Failed to load team data. Please try again.'}
					</p>
					<Button variant="outline" onClick={handleRetry}>
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="p-8 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Users className="h-8 w-8" />
					<h1 className="text-3xl font-bold">
						{team?.name} - Team Management
					</h1>
				</div>
				{hasPermission(teamId, 'manageRoles') && (
					<Button asChild>
						<Link href={`/teams/${teamId}/management/roles`}>
							<Settings className="mr-2 h-4 w-4" />
							Manage Roles
						</Link>
					</Button>
				)}
			</div>

			{/* Members List */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{members?.map((member) => (
					<Card key={member.id} className="relative">
						<CardHeader>
							<CardTitle>
								{member.user.name || member.user.email}
							</CardTitle>
							<CardDescription>
								{member.user.email}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center space-x-2">
								<Shield className="h-4 w-4 text-gray-400" />
								{hasPermission(teamId, 'manageMembers') ? (
									<Select
										value={member.teamRole.id}
										onValueChange={(newRoleId) =>
											roleMutation.mutate({
												memberId: member.id,
												roleId: newRoleId,
											})
										}
									>
										<SelectTrigger className="p-0 h-auto border-0 bg-transparent hover:bg-gray-100 rounded px-1 -ml-1">
											<span className="text-sm text-gray-600">
												{member.teamRole.name}
											</span>
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
								) : (
									<span className="text-sm text-gray-600">
										{member.teamRole.name}
									</span>
								)}
							</div>

							{/* Remove Member Button - Only show if user can manage team */}
							{hasPermission(teamId, 'manageMembers') && (
								<Button
									variant="destructive"
									className="w-full"
									onClick={() => setMemberToRemove(member)}
								>
									Remove Member
								</Button>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			<div className="flex gap-4">
				{/* Invite Dialog - Only show if user can manage team */}
				{hasPermission(teamId, 'manageMembers') && (
					<InviteDialog teamId={teamId} setMembers={updateMembers} />
				)}
			</div>

			{/* Remove Member Confirmation Dialog */}
			<AlertDialog
				open={!!memberToRemove}
				onOpenChange={() => setMemberToRemove(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove Team Member</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to remove{' '}
							{memberToRemove?.user.name ||
								memberToRemove?.user.email}{' '}
							from the team? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() =>
								memberToRemove &&
								removeMutation.mutate(memberToRemove.id)
							}
							className="bg-red-500 hover:bg-red-600"
						>
							Remove Member
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
