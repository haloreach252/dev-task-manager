'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, RefreshCcw } from 'lucide-react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectFilters } from '@/components/projects/ProjectFilters';

type Project = {
	id: string;
	name: string;
	description: string;
	team: { id: string; name: string };
	updatedAt: string;
	totalBoards: number;
	totalTasks: number;
	status?: 'active' | 'archived' | 'completed';
};

type Team = {
	id: string;
	name: string;
	description: string | null;
	totalMembers: number;
	permissions: string[];
};

export default function ProjectsPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [teamFilter, setTeamFilter] = useState('all');
	const [newProject, setNewProject] = useState({
		name: '',
		description: '',
		teamId: '',
	});

	// Fetch projects using React Query
	const {
		data: projects,
		isLoading,
		error,
		refetch,
	} = useQuery<Project[]>({
		queryKey: ['projects'],
		queryFn: async () => {
			const res = await axios.get('/api/projects');
			if (!res.data.success) {
				throw new Error(res.data.error.message);
			}
			return res.data.data.projects;
		},
	});

	// Fetch teams for the user
	const { data: teams, isLoading: teamsLoading } = useQuery<Team[]>({
		queryKey: ['teams'],
		queryFn: async () => {
			const res = await axios.get('/api/teams');
			if (!res.data.success) {
				throw new Error(res.data.error.message);
			}
			return res.data.data.teams;
		},
	});

	// Filter projects based on search query and filters
	const filteredProjects = useMemo(() => {
		if (!projects) return [];

		return projects.filter((project) => {
			const matchesSearch =
				project.name
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				project.description
					.toLowerCase()
					.includes(searchQuery.toLowerCase());

			const matchesStatus =
				statusFilter === 'all' || project.status === statusFilter;
			const matchesTeam =
				teamFilter === 'all' || project.team.id === teamFilter;

			return matchesSearch && matchesStatus && matchesTeam;
		});
	}, [projects, searchQuery, statusFilter, teamFilter]);

	// Mutation for creating new project
	const createProject = useMutation({
		mutationFn: async () => {
			const res = await axios.post('/api/projects', newProject);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['projects'] });
			setIsDialogOpen(false);
			toast({
				title: 'Project Created',
				description: 'The project was successfully created',
			});
			setNewProject({ name: '', description: '', teamId: '' });
		},
		onError: () => {
			toast({
				title: 'Error',
				description: 'Failed to create project.',
				variant: 'destructive',
			});
		},
	});

	return (
		<div className="p-8 space-y-8">
			{/* Header */}
			<Card className="p-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h1 className="text-3xl font-bold">
							Projects{' '}
							{projects ? `(${filteredProjects.length})` : ''}
						</h1>
						<p className="text-muted-foreground mt-1">
							Manage and organize your projects
						</p>
					</div>
					<Button onClick={() => setIsDialogOpen(true)}>
						<Plus className="w-5 h-5 mr-2" /> Create New Project
					</Button>
				</div>
			</Card>

			{/* Filters */}
			<Card className="p-6">
				<ProjectFilters
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					statusFilter={statusFilter}
					onStatusChange={setStatusFilter}
					teamFilter={teamFilter}
					onTeamChange={setTeamFilter}
					teams={teams || []}
				/>
			</Card>

			{/* Projects Grid */}
			{isLoading ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{[...Array(6)].map((_, i) => (
						<Skeleton key={i} className="h-32 rounded-lg" />
					))}
				</div>
			) : error ? (
				<div className="flex flex-col items-center space-y-4">
					<p className="text-red-500">Failed to load projects.</p>
					<Button variant="outline" onClick={() => refetch()}>
						<RefreshCcw className="w-5 h-5 mr-2" />
						Retry
					</Button>
				</div>
			) : filteredProjects.length ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredProjects.map((project) => (
						<ProjectCard
							key={project.id}
							project={project}
							onClick={() =>
								router.push(`/projects/${project.id}`)
							}
						/>
					))}
				</div>
			) : (
				<Card className="p-6">
					<div className="text-center space-y-4">
						<p className="text-muted-foreground">
							{searchQuery ||
							statusFilter !== 'all' ||
							teamFilter !== 'all'
								? 'No projects match your filters.'
								: 'No projects found. Start by creating one!'}
						</p>
						{searchQuery ||
						statusFilter !== 'all' ||
						teamFilter !== 'all' ? (
							<Button
								variant="outline"
								onClick={() => {
									setSearchQuery('');
									setStatusFilter('all');
									setTeamFilter('all');
								}}
							>
								Clear Filters
							</Button>
						) : null}
					</div>
				</Card>
			)}

			{/* Create Project Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Project</DialogTitle>
					</DialogHeader>

					<Input
						placeholder="Project Name"
						value={newProject.name}
						onChange={(e) =>
							setNewProject({
								...newProject,
								name: e.target.value,
							})
						}
					/>

					<Textarea
						placeholder="Project Description"
						value={newProject.description}
						onChange={(e) =>
							setNewProject({
								...newProject,
								description: e.target.value,
							})
						}
					/>

					<Select
						value={newProject.teamId}
						onValueChange={(value) =>
							setNewProject({ ...newProject, teamId: value })
						}
						disabled={teamsLoading}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select a Team" />
						</SelectTrigger>
						<SelectContent>
							{teams?.map((team) => (
								<SelectItem key={team.id} value={team.id}>
									{team.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<DialogFooter>
						<Button
							onClick={() => createProject.mutate()}
							disabled={!newProject.name || !newProject.teamId}
						>
							Create Project
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
