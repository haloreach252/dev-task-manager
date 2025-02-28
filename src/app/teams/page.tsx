/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
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
import { Users, PlusCircle, Trash, Pencil, Check, X, Loader } from 'lucide-react';
import DeleteTeamDialog from './DeleteTeamDialog';
import { useRouter } from 'next/navigation';

type Team = {
	id: string;
	name: string;
	totalMembers: number;
	permissions: string[];
};

const editPermissions = [
	"*",
	"editTeam"
]

const deletePermissions = [
	"*",
	"deleteTeam"
]

function checkPermissions(userPermissions: string[], againstPermissions: string[]) {
	return userPermissions.some(r => againstPermissions.includes(r));
}

export default function TeamsDashboard() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const [newTeamName, setNewTeamName] = useState('');
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
	const [editedTeamName, setEditedTeamName] = useState('');
	const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

	// Fetch Teams using react-query
	const {
		data: teams,
		isLoading,
		error,
	} = useQuery<Team[]>({
		queryKey: ['teams'],
		queryFn: async () => {
			const res = await axios.get('/api/teams');
			return res.data.teams.sort((a: Team, b: Team) =>
				a.name.localeCompare(b.name)
			);
		},
	});

	// Mutation to create a team
	const createTeam = useMutation({
		mutationFn: async () => {
			const res = await axios.post('/api/teams', { name: newTeamName });
			return res.data;
		},
		onSuccess: (newTeam) => {
			queryClient.invalidateQueries({ queryKey: ['teams'] });
			setIsDialogOpen(false);
			setNewTeamName('');
			toast({
				title: 'Team Created',
				description: `Team "${newTeamName}" was successfully created.`,
			});
		},
		onError: () => {
			toast({
				title: 'Error',
				description: 'Failed to create team.',
				variant: 'destructive',
			});
		},
	});

	// Mutation to update team name
	const updateTeamName = useMutation({
		mutationFn: async ({ teamId, name }: { teamId: string; name: string }) => {
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
		if (!checkPermissions(team.permissions, editPermissions)) return;
		setEditingTeamId(team.id);
		setEditedTeamName(team.name);
	};

	const handleSave = (teamId: string) => {
		if (editedTeamName.trim() && editedTeamName !== teams?.find((t) => t.id === teamId)?.name) {
			updateTeamName.mutate({ teamId, name: editedTeamName });
		} else {
			setEditingTeamId(null);
		}
	};

	return (
		<div className="p-8 space-y-8">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="flex justify-between items-center"
			>
				<h1 className="text-3xl font-bold">Your Teams</h1>
				<Button onClick={() => setIsDialogOpen(true)}>
					<PlusCircle className="w-5 h-5 mr-2" /> Create New Team
				</Button>
			</motion.div>

			{/* Teams Grid */}
			{isLoading ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{[...Array(6)].map((_, i) => (
						<Skeleton key={i} className="h-32 rounded-lg" />
					))}
				</div>
			) : error ? (
				<div className="text-center text-red-500">Failed to load teams.</div>
			) : teams?.length ? (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
				>
					{teams.map((team) => (
						<motion.div key={team.id} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
							<Card className="hover:shadow-lg transition-transform cursor-pointer">
								<CardHeader className="flex justify-between items-center">
									{editingTeamId === team.id ? (
										<Input
											value={editedTeamName}
											onChange={(e) => setEditedTeamName(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === 'Enter' && checkPermissions(team.permissions, editPermissions)) handleSave(team.id);
												if (e.key === 'Escape' && checkPermissions(team.permissions, editPermissions)) setEditingTeamId(null);
											}}
											autoFocus
											onBlur={() => handleSave(team.id)}
										/>
									) : (
										<CardTitle className="flex justify-between items-center cursor-pointer" onClick={() => handleEdit(team)}>
											{team.name}
											{checkPermissions(team.permissions, editPermissions) && (
												<Button size="icon" variant="ghost">
													<Pencil className="w-4 h-4 text-gray-500" />
												</Button>
											)}
										</CardTitle>
									)}
								</CardHeader>
								<CardContent onClick={() => router.push(`/teams/${team.id}`)}>
									<div className="flex justify-between items-center text-sm text-gray-700">
										<div className="flex items-center gap-2">
											<Users className="w-4 h-4 text-indigo-600" />
											<span>{team.totalMembers} Members</span>
										</div>
										{checkPermissions(team.permissions, deletePermissions) && (
											<Button size="icon" variant="ghost" onClick={() => deleteTeam.mutate(team.id)}>
												<Trash className="w-4 h-4 text-red-500" />
											</Button>
										)}
									</div>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</motion.div>
			) : (
				<div className="text-center text-gray-600">
					<p className="text-lg">You are not part of any teams.</p>
					<p>Create one to get started!</p>
				</div>
			)}

			{/* Create Team Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Team Name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
          />

          <DialogFooter>
            <Button onClick={() => createTeam.mutate()} disabled={!newTeamName}>
              {createTeam.isPending ? <Loader className="animate-spin w-5 h-5" /> : 'Create Team'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

	  {/* Delete Team Confirmation Dialog */}
		<DeleteTeamDialog
			isOpen={!!teamToDelete}
			onClose={() => setTeamToDelete(null)}
			onConfirm={() => {
				if (teamToDelete) {
					deleteTeam.mutate(teamToDelete.id);
					setTeamToDelete(null);
				}
			}}
		/>
		</div>
	);
}
