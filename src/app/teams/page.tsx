'use client';

import { useEffect, useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';

type Team = {
	id: string;
	name: string;
};

export default function TeamsDashboard() {
	const [teams, setTeams] = useState<Team[]>([]);
	const [newTeamName, setNewTeamName] = useState('');
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const { toast } = useToast();

	useEffect(() => {
		axios
			.get('/api/teams')
			.then((res) => setTeams(res.data.teams))
			.catch((err) => {
				console.error(err);
				toast({
					title: 'Error',
					description: 'Failed to fetch teams',
					variant: 'destructive',
				});
			});
	}, [toast]);

	const handleCreateTeam = async () => {
		if (!newTeamName) return;

		try {
			const res = await axios.post('/api/teams', { name: newTeamName });
			setTeams([...teams, res.data]);
			setNewTeamName('');
			setIsDialogOpen(false);
			toast({
				title: 'Team Created',
				description: `Team "${newTeamName}" was successfully created.`,
			});
		} catch (error) {
			console.error(error);
			toast({
				title: 'Error',
				description: 'Failed to create team',
				variant: 'destructive',
			});
		}
	};

	return (
		<div className="p-8">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Your Teams</h1>
				<Button onClick={() => setIsDialogOpen(true)}>
					Create New Team
				</Button>
			</div>

			{/* Teams Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{teams.map((team) => (
					<Card key={team.id} className="hover:shadow-lg">
						<CardHeader>
							<CardTitle>{team.name}</CardTitle>
						</CardHeader>
						<CardContent>
							<Link href={`/teams/${team.id}`}>
								<Button className="w-full">View Team</Button>
							</Link>
						</CardContent>
					</Card>
				))}
			</div>

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
						<Button
							onClick={handleCreateTeam}
							disabled={!newTeamName}
						>
							Create Team
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
