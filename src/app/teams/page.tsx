// src/app/teams/page.tsx

/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
	Users,
	PlusCircle,
	Trash,
	Pencil,
	Check,
	X,
	Loader,
	ArrowBigRightDash,
	Plus,
} from 'lucide-react';
import DeleteTeamDialog from './DeleteTeamDialog';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Team = {
	id: string;
	name: string;
	description: string;
	totalMembers: number;
	permissions: Record<string, boolean>;
};

export default function TeamsDashboard() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const [newTeamName, setNewTeamName] = useState('');
	const [newTeamDescription, setNewTeamDescription] = useState('');
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
	const [editedTeamName, setEditedTeamName] = useState('');
	const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
	const [searchQuery, setSearchQuery] = useState('');

	// Fetch Teams using react-query
	const {
		data: teams,
		isLoading,
		error,
	} = useQuery<Team[]>({
		queryKey: ['teams'],
		queryFn: async () => {
			const res = await axios.get('/api/teams');
			if (!res.data.success) {
				throw new Error(res.data.error.message);
			}
			return res.data.data.teams.sort((a: Team, b: Team) =>
				a.name.localeCompare(b.name)
			);
		},
	});

	const teamIds = teams?.map((team) => team.id) || [];
	const { hasPermission } = usePermissions(teamIds);

	// Filter teams based on search query
	const filteredTeams = teams?.filter(
		(team) =>
			team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			team.description?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Calculate team statistics
	const teamStats = teams
		? {
				totalTeams: teams.length,
				totalMembers: teams.reduce(
					(acc, team) => acc + team.totalMembers,
					0
				),
				averageMembers: Math.round(
					teams.reduce((acc, team) => acc + team.totalMembers, 0) /
						teams.length
				),
				largestTeam: teams.reduce(
					(max, team) =>
						team.totalMembers > max ? team.totalMembers : max,
					0
				),
		  }
		: null;

	// Mutation to create a team
	const createTeam = useMutation({
		mutationFn: async () => {
			const res = await axios.post('/api/teams', {
				name: newTeamName,
				description: newTeamDescription,
			});
			return res.data;
		},
		onSuccess: (newTeam) => {
			queryClient.invalidateQueries({ queryKey: ['teams'] });
			setIsDialogOpen(false);
			setNewTeamName('');
			setNewTeamDescription('');
			toast({
				title: 'Team Created',
				description: `Team "${newTeamName}" was successfully created.`,
			});
		},
		onError: (error: Error) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to create team.',
				variant: 'destructive',
			});
		},
	});

	// Mutation to update team name
	const updateTeamName = useMutation({
		mutationFn: async ({
			teamId,
			name,
		}: {
			teamId: string;
			name: string;
		}) => {
			await axios.put(`/api/teams/${teamId}`, { name });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['teams'] });
			setEditingTeamId(null);
			toast({
				title: 'Team Updated',
				description: 'Team name updated successfully.',
			});
		},
		onError: () => {
			toast({
				title: 'Error',
				description: 'Failed to update team name.',
				variant: 'destructive',
			});
		},
	});

	// Mutation to delete a team
	const deleteTeam = useMutation({
		mutationFn: async (teamId: string) => {
			await axios.delete(`/api/teams/${teamId}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['teams'] });
			toast({
				title: 'Team Deleted',
				description: 'The team was successfully deleted.',
			});
		},
		onError: () => {
			toast({
				title: 'Error',
				description: 'Failed to delete team.',
				variant: 'destructive',
			});
		},
	});

	const handleEdit = (team: Team) => {
		console.log('handleEdit called with team:', team);
		const hasEditPermission = hasPermission(team.id, 'editTeam');
		console.log('hasEditPermission:', hasEditPermission);
		if (!hasEditPermission) return;
		console.log('Setting editingTeamId to:', team.id);
		setEditingTeamId(team.id);
		setEditedTeamName(team.name);
	};

	// Add effect to monitor editingTeamId changes
	useEffect(() => {
		console.log('editingTeamId changed to:', editingTeamId);
	}, [editingTeamId]);

	const handleSave = (teamId: string) => {
		if (
			editedTeamName.trim() &&
			editedTeamName !== teams?.find((t) => t.id === teamId)?.name
		) {
			updateTeamName.mutate({ teamId, name: editedTeamName });
		} else {
			setEditingTeamId(null);
		}
	};

	return (
		<div className="p-8 space-y-8">
			{/* Header with Statistics */}
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="space-y-6"
			>
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold">Your Teams</h1>
					<Button onClick={() => setIsDialogOpen(true)}>
						<PlusCircle className="w-5 h-5 mr-2" /> Create New Team
					</Button>
				</div>

				{teamStats && (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						<Card>
							<CardHeader>
								<CardTitle className="text-sm font-medium">
									Total Teams
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{teamStats.totalTeams}
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle className="text-sm font-medium">
									Total Members
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{teamStats.totalMembers}
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle className="text-sm font-medium">
									Average Team Size
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{teamStats.averageMembers}
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle className="text-sm font-medium">
									Largest Team
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{teamStats.largestTeam} members
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Search Input */}
				<div className="relative">
					<Input
						type="text"
						placeholder="Search teams..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full max-w-sm"
					/>
				</div>
			</motion.div>

			{/* Teams Grid */}
			{isLoading ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{[...Array(6)].map((_, i) => (
						<Skeleton key={i} className="h-32 rounded-lg" />
					))}
				</div>
			) : error ? (
				<Alert variant="destructive">
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>
						{error instanceof Error
							? error.message
							: 'Failed to load teams'}
					</AlertDescription>
				</Alert>
			) : filteredTeams?.length ? (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
				>
					{filteredTeams.map((team) => (
						<motion.div
							key={team.id}
							whileHover={{ scale: 1.02 }}
							transition={{ duration: 0.2 }}
						>
							<Card className="hover:shadow-lg transition-transform">
								<CardHeader className="flex justify-between items-center">
									{editingTeamId === team.id ? (
										<div className="flex items-center gap-2 w-full">
											<Input
												value={editedTeamName}
												onChange={(e) =>
													setEditedTeamName(
														e.target.value
													)
												}
												onKeyDown={(e) => {
													if (
														e.key === 'Enter' &&
														hasPermission(
															team.id,
															'editTeam'
														)
													)
														handleSave(team.id);
													if (
														e.key === 'Escape' &&
														hasPermission(
															team.id,
															'editTeam'
														)
													)
														setEditingTeamId(null);
												}}
												autoFocus
												disabled={
													updateTeamName.isPending
												}
											/>
											{updateTeamName.isPending && (
												<Loader className="w-4 h-4 animate-spin" />
											)}
										</div>
									) : (
										<CardTitle className="flex justify-between items-center w-full">
											<span
												className="text-lg font-semibold hover:text-primary cursor-pointer"
												onClick={(e) => {
													console.log(
														'Team name clicked'
													);
													e.stopPropagation();
													const canEdit =
														hasPermission(
															team.id,
															'editTeam'
														);
													console.log(
														'Can edit team?',
														canEdit
													);
													if (canEdit) {
														handleEdit(team);
													}
												}}
											>
												{team.name}
											</span>
											<div className="flex items-center gap-2">
												{hasPermission(
													team.id,
													'editTeam'
												) && (
													<Button
														variant="ghost"
														size="sm"
														onClick={(e) => {
															e.stopPropagation();
															handleEdit(team);
														}}
														className="hover:bg-accent"
													>
														<Pencil className="w-4 h-4 mr-2" />
														Edit
													</Button>
												)}
												{hasPermission(
													team.id,
													'deleteTeam'
												) && (
													<Button
														variant="ghost"
														size="sm"
														onClick={(e) => {
															e.stopPropagation();
															setTeamToDelete(
																team
															);
														}}
														disabled={
															deleteTeam.isPending
														}
														className="hover:bg-destructive hover:text-destructive-foreground"
													>
														{deleteTeam.isPending ? (
															<>
																<Loader className="w-4 h-4 mr-2 animate-spin" />
																Deleting...
															</>
														) : (
															<>
																<Trash className="w-4 h-4 mr-2" />
																Delete
															</>
														)}
													</Button>
												)}
											</div>
										</CardTitle>
									)}
								</CardHeader>
								<CardContent
									className="cursor-pointer"
									onClick={() =>
										router.push(`/teams/${team.id}`)
									}
								>
									<div className="flex flex-col gap-4">
										<p className="text-sm text-muted-foreground">
											{team.description ||
												'No description'}
										</p>
										<div className="flex justify-between items-center">
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<Users className="w-4 h-4" />
												{team.totalMembers}{' '}
												{team.totalMembers === 1
													? 'member'
													: 'members'}
											</div>
											<Button
												variant="outline"
												size="sm"
												className="gap-2"
											>
												View Team{' '}
												<ArrowBigRightDash className="w-4 h-4" />
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</motion.div>
			) : (
				<Card className="p-6">
					<div className="text-center space-y-4">
						<p className="text-muted-foreground">
							{searchQuery
								? 'No teams found matching your search.'
								: 'No teams found. Start by creating one!'}
						</p>
						<Button onClick={() => setIsDialogOpen(true)}>
							<Plus className="w-5 h-5 mr-2" />
							Create New Team
						</Button>
					</div>
				</Card>
			)}

			{/* Create Team Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Team</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<label
								htmlFor="teamName"
								className="text-sm font-medium"
							>
								Team Name
							</label>
							<Input
								id="teamName"
								value={newTeamName}
								onChange={(e) => setNewTeamName(e.target.value)}
								placeholder="Enter team name"
								disabled={createTeam.isPending}
							/>
						</div>
						<div className="space-y-2">
							<label
								htmlFor="teamDescription"
								className="text-sm font-medium"
							>
								Description (optional)
							</label>
							<Input
								id="teamDescription"
								value={newTeamDescription}
								onChange={(e) =>
									setNewTeamDescription(e.target.value)
								}
								placeholder="Enter team description"
								disabled={createTeam.isPending}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDialogOpen(false)}
							disabled={createTeam.isPending}
						>
							Cancel
						</Button>
						<Button
							onClick={() => createTeam.mutate()}
							disabled={
								!newTeamName.trim() || createTeam.isPending
							}
						>
							{createTeam.isPending ? (
								<>
									<Loader className="w-4 h-4 mr-2 animate-spin" />
									Creating...
								</>
							) : (
								<>
									<PlusCircle className="w-4 h-4 mr-2" />
									Create Team
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Team Dialog */}
			<DeleteTeamDialog
				team={teamToDelete}
				onClose={() => setTeamToDelete(null)}
				onConfirm={(teamId) => {
					deleteTeam.mutate(teamId);
					setTeamToDelete(null);
				}}
				isDeleting={deleteTeam.isPending}
			/>
		</div>
	);
}
