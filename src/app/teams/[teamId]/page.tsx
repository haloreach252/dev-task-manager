/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Users,
	FolderKanban,
	Plus,
	Pencil,
	Check,
	X,
	AlertCircle,
	RefreshCcw,
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

type Team = {
	id: string;
	name: string;
	description?: string;
	permissions: Record<string, boolean>;
};

type Member = {
	id: string;
	user: { id: string; email: string; name?: string };
	teamRole: { id: string; name: string };
	joinedAt?: string;
};

type Project = {
	id: string;
	name: string;
	description?: string;
	status?: string;
	tasksCount?: number;
};

const MAX_DESCRIPTION_LENGTH = 500;

export default function TeamOverview() {
	const params = useParams();
	const teamId = params.teamId as string;
	const { toast } = useToast();
	const { hasPermission } = usePermissions(teamId);
	const queryClient = useQueryClient();
	const [isEditingDescription, setIsEditingDescription] = useState(false);
	const [updatedDescription, setUpdatedDescription] = useState('');
	const [activeTab, setActiveTab] = useState('members');

	const { data, isLoading, error, refetch } = useQuery<{
		team: Team;
		members: Member[];
		projects: Project[];
	}>({
		queryKey: ['team', teamId],
		queryFn: async () => {
			const res = await axios.get(`/api/teams/${teamId}`);
			if (!res.data.success) {
				throw new Error(
					res.data.error?.message || 'Failed to load team details'
				);
			}
			return res.data.data;
		},
		retry: 2,
	});

	const updateDescription = useMutation({
		mutationFn: async (description: string) => {
			if (!description.trim()) {
				throw new Error('Description cannot be empty');
			}
			if (description.length > MAX_DESCRIPTION_LENGTH) {
				throw new Error(
					`Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`
				);
			}
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
		onError: (error: Error) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to update description.',
				variant: 'destructive',
			});
		},
	});

	if (isLoading) {
		return (
			<div className="p-8 space-y-6">
				<div className="space-y-4">
					<Skeleton className="h-10 w-1/3" />
					<Skeleton className="h-6 w-2/3" />
				</div>
				<div className="space-y-4">
					<Skeleton className="h-10 w-full" />
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{[1, 2, 3].map((i) => (
							<Card
								key={`loading-skeleton-${i}`}
								className="space-y-2"
							>
								<CardHeader>
									<Skeleton className="h-6 w-2/3" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-3/4 mt-2" />
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error || !data?.team) {
		return (
			<div className="p-8">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>
						Failed to load team details.{' '}
						<Button
							variant="link"
							className="p-0 h-auto font-normal"
							onClick={() => refetch()}
						>
							<RefreshCcw className="h-4 w-4 mr-1" />
							Try again
						</Button>
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	const { team, members, projects } = data;

	const handleStartEditing = () => {
		setUpdatedDescription(team.description || '');
		setIsEditingDescription(true);
	};

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
				className="space-y-4"
			>
				<div className="flex items-center justify-between">
					<h1 className="text-3xl font-bold">{team.name}</h1>
					{hasPermission(teamId, 'manageMembers') && (
						<Button asChild>
							<Link href={`/teams/${teamId}/management`}>
								<Users className="w-5 h-5 mr-2" /> Manage Team
							</Link>
						</Button>
					)}
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Description</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-start gap-2">
							{isEditingDescription ? (
								<div className="w-full space-y-2">
									<Textarea
										value={updatedDescription}
										onChange={(e) =>
											setUpdatedDescription(
												e.target.value
											)
										}
										className="w-full"
										placeholder="Enter team description..."
										maxLength={MAX_DESCRIPTION_LENGTH}
										rows={3}
										autoFocus
									/>
									<div className="flex items-center justify-between">
										<p className="text-sm text-gray-500">
											{updatedDescription.length}/
											{MAX_DESCRIPTION_LENGTH} characters
										</p>
										<div className="space-x-2">
											<Button
												size="sm"
												onClick={() =>
													updateDescription.mutate(
														updatedDescription
													)
												}
												disabled={
													updateDescription.isPending
												}
											>
												{updateDescription.isPending ? (
													<motion.div
														animate={{
															rotate: 360,
														}}
														transition={{
															duration: 1,
															repeat: Infinity,
															ease: 'linear',
														}}
													>
														<RefreshCcw className="w-4 h-4 mr-2" />
													</motion.div>
												) : (
													<Check className="w-4 h-4 mr-2" />
												)}
												Save
											</Button>
											<Button
												size="sm"
												variant="outline"
												onClick={() =>
													setIsEditingDescription(
														false
													)
												}
											>
												<X className="w-4 h-4 mr-2" />
												Cancel
											</Button>
										</div>
									</div>
								</div>
							) : (
								<>
									<p className="text-gray-600 flex-grow">
										{team.description ||
											'No description available'}
									</p>
									{hasPermission(teamId, 'editTeam') && (
										<Button
											size="icon"
											variant="ghost"
											onClick={handleStartEditing}
										>
											<Pencil className="w-5 h-5 text-gray-500" />
										</Button>
									)}
								</>
							)}
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Tabs Section */}
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full"
			>
				<TabsList className="grid grid-cols-2">
					<TabsTrigger
						value="members"
						className="flex items-center gap-2"
					>
						<Users className="w-4 h-4" />
						Team Members
						<Badge variant="secondary" className="ml-2">
							{members.length}
						</Badge>
					</TabsTrigger>
					<TabsTrigger
						value="projects"
						className="flex items-center gap-2"
					>
						<FolderKanban className="w-4 h-4" />
						Projects
						<Badge variant="secondary" className="ml-2">
							{projects.length}
						</Badge>
					</TabsTrigger>
				</TabsList>

				<AnimatePresence mode="wait">
					{/* Team Members Tab */}
					<TabsContent value="members" key="members-tab">
						<motion.div
							key="members-content"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.2 }}
						>
							{members.length === 0 ? (
								<Card>
									<CardContent className="pt-6">
										<div className="text-center space-y-2">
											<Users className="w-12 h-12 mx-auto text-gray-400" />
											<h3 className="text-lg font-semibold">
												No team members yet
											</h3>
											<p className="text-gray-600">
												Start by inviting members to
												your team.
											</p>
											{hasPermission(
												teamId,
												'manageMembers'
											) && (
												<Button
													asChild
													className="mt-2"
												>
													<Link
														href={`/teams/${teamId}/management`}
													>
														<Plus className="w-4 h-4 mr-2" />
														Invite Members
													</Link>
												</Button>
											)}
										</div>
									</CardContent>
								</Card>
							) : (
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
									{members.map((member) => (
										<Card key={member.id}>
											<CardHeader>
												<CardTitle>
													{member.user.name ||
														member.user.email}
												</CardTitle>
												<CardDescription>
													{member.user.email}
												</CardDescription>
											</CardHeader>
											<CardContent className="space-y-2">
												<Badge variant="secondary">
													{member.teamRole.name}
												</Badge>
												{member.joinedAt && (
													<p className="text-sm text-gray-600">
														Joined{' '}
														{new Date(
															member.joinedAt
														).toLocaleDateString()}
													</p>
												)}
											</CardContent>
										</Card>
									))}
								</div>
							)}
						</motion.div>
					</TabsContent>

					{/* Projects tab */}
					<TabsContent value="projects" key="projects-tab">
						<motion.div
							key="projects-content"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.2 }}
						>
							{projects.length === 0 ? (
								<Card>
									<CardContent className="pt-6">
										<div className="text-center space-y-2">
											<FolderKanban className="w-12 h-12 mx-auto text-gray-400" />
											<h3 className="text-lg font-semibold">
												No projects yet
											</h3>
											<p className="text-gray-600">
												Create your first project to get
												started.
											</p>
											{hasPermission(
												teamId,
												'createProjects'
											) && (
												<Button
													asChild
													className="mt-2"
												>
													<Link
														href={`/projects/new?teamId=${teamId}`}
													>
														<Plus className="w-4 h-4 mr-2" />
														Create Project
													</Link>
												</Button>
											)}
										</div>
									</CardContent>
								</Card>
							) : (
								<>
									{hasPermission(
										teamId,
										'createProjects'
									) && (
										<div className="mb-4">
											<Button asChild>
												<Link
													href={`/projects/new?teamId=${teamId}`}
												>
													<Plus className="w-4 h-4 mr-2" />
													New Project
												</Link>
											</Button>
										</div>
									)}
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
										{projects.map((project) => (
											<Card key={project.id}>
												<CardHeader>
													<CardTitle className="flex items-center justify-between">
														{project.name}
														{project.status && (
															<Badge>
																{project.status}
															</Badge>
														)}
													</CardTitle>
													<CardDescription>
														{project.description ||
															'No description available'}
													</CardDescription>
												</CardHeader>
												<CardContent>
													{project.tasksCount !==
														undefined && (
														<p className="text-sm text-gray-600 mb-3">
															{project.tasksCount}{' '}
															tasks
														</p>
													)}
													<Button
														className="w-full"
														asChild
													>
														<Link
															href={`/projects/${project.id}`}
														>
															<FolderKanban className="w-4 h-4 mr-2" />
															View Project
														</Link>
													</Button>
												</CardContent>
											</Card>
										))}
									</div>
								</>
							)}
						</motion.div>
					</TabsContent>
				</AnimatePresence>
			</Tabs>
		</motion.div>
	);
}
