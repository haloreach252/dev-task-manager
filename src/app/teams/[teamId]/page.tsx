// src/app/teams/[teamId]/page.tsx

/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Users, FolderKanban, Plus } from 'lucide-react';

const manageMembersPermissions = ['*', 'manageMembers'];
const manageProjectsPermissions = ['*', 'manageProjects'];

function checkPermissions(
	userPermissions: string[] = [],
	requiredPermissions: string[]
) {
	return userPermissions.some((perm) => requiredPermissions.includes(perm));
}

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
	const [team, setTeam] = useState<Team | null>(null);
	const [members, setMembers] = useState<Member[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { toast } = useToast();

	useEffect(() => {
		const fetchTeamData = async () => {
			try {
				const res = await axios.get(`/api/teams/${teamId}`);
				setTeam(res.data.team);
				setMembers(res.data.members);
				setProjects(res.data.projects);
			} catch (err) {
				console.error(err);
				toast({
					title: 'Error',
					description: 'Failed to fetch team details',
					variant: 'destructive',
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchTeamData();
	}, [teamId, toast]);

	if (isLoading)
		return (
			<div className="p-8 space-y-4">
				<Skeleton className="h-8 w-1/3" />
				<Skeleton className="h-4 w-2/3" />
				<Skeleton className="h-4 w-full" />
			</div>
		);

	if (!team) return <div className="p-8 text-red-500">Team not found.</div>;

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
				<p className="text-gray-600">
					{team.description || 'No description available'}
				</p>
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
							<motion.div
								key={member.id}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3 }}
							>
								<Card>
									<CardHeader>
										<CardTitle>
											{member.user.name ||
												member.user.email}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-sm text-gray-600">
											Role: {member.teamRole.name}
										</p>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>

					{checkPermissions(
						team.permissions,
						manageMembersPermissions
					) && (
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
							<motion.div
								key={project.id}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3 }}
							>
								<Card>
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
											<Link
												href={`/projects/${project.id}`}
											>
												<FolderKanban className="w-5 h-5" />{' '}
												View Project
											</Link>
										</Button>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>

					{checkPermissions(
						team.permissions,
						manageProjectsPermissions
					) && (
						<Button
							className="mt-4 flex items-center gap-2"
							asChild
						>
							<Link href={`/teams/${teamId}/projects`}>
								<Plus className="w-5 h-5" /> Manage Projects
							</Link>
						</Button>
					)}
				</TabsContent>
			</Tabs>
		</motion.div>
	);
}
