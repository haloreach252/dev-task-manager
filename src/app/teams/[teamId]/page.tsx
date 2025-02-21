'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

type Team = {
	id: string;
	name: string;
	description?: string;
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
	const { toast } = useToast();

	useEffect(() => {
		axios
			.get(`/api/teams/${teamId}`)
			.then((res) => setTeam(res.data.team))
			.catch((err) => {
				console.error(err);
				toast({
					title: 'Error',
					description: 'Failed to fetch team details',
					variant: 'destructive',
				});
			});

		axios
			.get(`/api/teams/${teamId}/members`)
			.then((res) => setMembers(res.data.members))
			.catch((err) => console.error('Failed to fetch team members', err));

		axios
			.get(`/api/teams/${teamId}/projects`)
			.then((res) => setProjects(res.data.projects))
			.catch((err) => console.error('Failed to fetch projects', err));
	}, [teamId, toast]);

	if (!team) return <div className="p-8">Loading team details...</div>;

	return (
		<div className="p-8">
			<h1 className="text-3xl font-bold mb-4">{team.name} Overview</h1>
			<p className="mb-6">
				{team.description || 'No description available'}
			</p>

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
									<CardContent>
										<p className="text-sm text-gray-600">
											Role: {member.teamRole.name}
										</p>
									</CardContent>
								</CardHeader>
							</Card>
						))}
					</div>

					<Button className="mt-4" asChild>
						<Link href={`/teams/${teamId}/management`}>
							Manage Members
						</Link>
					</Button>
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
									<Button className="mt-2" asChild>
										<Link href={`/projects/${project.id}`}>
											View Project
										</Link>
									</Button>
								</CardContent>
							</Card>
						))}
					</div>

					<Button className="mt-4" asChild>
						<Link href={`/teams/${teamId}/projects`}>
							View All Projects
						</Link>
					</Button>
				</TabsContent>
			</Tabs>
		</div>
	);
}
