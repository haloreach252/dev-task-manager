/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Users, FolderKanban, Plus, Pencil, Check, X } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

type Team = {
	id: string;
	name: string;
	description?: string;
	permissions: string[];
};

type Member = {
	id: string;
	user: { id: string; email: string; name?: string };
	teamRole: { id: string; name: string };
};

type Project = {
	id: string;
	name: string;
	description?: string;
};

export default function TeamOverview() {
	const params = useParams();
	const teamId = params.teamId as string;
	const { toast } = useToast();
	const { hasPermission } = usePermissions(teamId);
	const queryClient = useQueryClient();
	const [isEditingDescription, setIsEditingDescription] = useState(false);
	const [updatedDescription, setUpdatedDescription] = useState('');

	const { data, isLoading, error } = useQuery<{
		team: Team;
		members: Member[];
		projects: Project[];
	}>({
		queryKey: ['team', teamId],
		queryFn: async () => {
			const res = await axios.get(`/api/teams/${teamId}`);
			return res.data;
		},
	});

	const updateDescription = useMutation({
		mutationFn: async (description: string) => {
			await axios.put(`/api/teams/${teamId}`, { description });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['team', teamId] });
			setIsEditingDescription(false);
			toast({
				title: 'Updated',
				description: 'Team description updated successfully.',
			});
		},
		onError: () => {
			toast({
				title: 'Error',
				description: 'Failed to update description.',
				variant: 'destructive',
			});
		},
	});

	if (isLoading)
		return (
			<div className="p-8 space-y-4">
				<Skeleton className="h-8 w-1/3" />
				<Skeleton className="h-4 w-2/3" />
				<Skeleton className="h-4 w-full" />
			</div>
		);

	if (error || !data?.team)
		return (
			<div className="p-8 text-red-500">Failed to load team details.</div>
		);

	const { team, members, projects } = data;

	return (
		<motion.div
			className="p-8 space-y-6"
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			{/* Team Overview */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.2 }}
			>
				<h1 className="text-3xl font-bold">{team.name} Overview</h1>
				<div className="flex items-center gap-2">
					{isEditingDescription ? (
						<>
							<Input
								value={updatedDescription}
								onChange={(e) =>
									setUpdatedDescription(e.target.value)
								}
								className="w-full"
								autoFocus
							/>
							<Button
								size="icon"
								variant="ghost"
								onClick={() =>
									updateDescription.mutate(updatedDescription)
								}
							>
								<Check className="w-5 h-5 text-green-500" />
							</Button>
							<Button
								size="icon"
								variant="ghost"
								onClick={() => setIsEditingDescription(false)}
							>
								<X className="w-5 h-5 text-red-500" />
							</Button>
						</>
					) : (
						<>
							<p className="text-gray-600">
								{team.description || 'No description available'}
							</p>
							{hasPermission(teamId, 'editTeam') && (
								<Button
									size="icon"
									variant="ghost"
									onClick={() =>
										setIsEditingDescription(true)
									}
								>
									<Pencil className="w-5 h-5 text-gray-500" />
								</Button>
							)}
						</>
					)}
				</div>
			</motion.div>

			{/* Tabs Section */}
			<Tabs defaultValue="members" className="w-full">
				<TabsList className="grid grid-cols-2">
					<TabsTrigger value="members">Team Members</TabsTrigger>
					<TabsTrigger value="projects">Projects</TabsTrigger>
				</TabsList>

				{/* Team Members Tab */}
				<TabsContent value="members">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
						{members.map((member) => (
							<Card key={member.id}>
								<CardHeader>
									<CardTitle>
										{member.user.name || member.user.email}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-gray-600">
										Role: {member.teamRole.name}
									</p>
								</CardContent>
							</Card>
						))}
					</div>

					{hasPermission(teamId, 'manageMembers') && (
						<Button
							className="mt-4 flex items-center gap-2"
							asChild
						>
							<Link href={`/teams/${teamId}/management`}>
								<Users className="w-5 h-5" /> Manage Members
							</Link>
						</Button>
					)}
				</TabsContent>

				{/* Projects tab */}
				<TabsContent value="projects">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
						{projects.map((project) => (
							<Card key={project.id}>
								<CardHeader>
									<CardTitle>{project.name}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-gray-600">
										{project.description ||
											'No description available'}
									</p>
									<Button
										className="mt-2 flex items-center gap-2"
										asChild
									>
										<Link href={`/projects/${project.id}`}>
											<FolderKanban className="w-5 h-5" />{' '}
											View Project
										</Link>
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>
			</Tabs>
		</motion.div>
	);
}
