'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import axios, { AxiosError } from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

interface Project {
	id: string;
	name: string;
	description: string | null;
	teamId: string;
	createdAt: string;
	updatedAt: string;
}

interface ProjectsResponse {
	projects: Project[];
}

interface ApiResponse {
	success: boolean;
	data: ProjectsResponse;
	error?: {
		code: string;
		message: string;
	};
}

const ProjectCard = motion(({ project }: { project: Project }) => (
	<Link href={`/projects/${project.id}`}>
		<Card className="hover:shadow-lg cursor-pointer transition-all duration-200">
			<CardHeader>
				<CardTitle>{project.name}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					<p className="text-sm text-gray-400">
						Created:{' '}
						{new Date(project.createdAt).toLocaleDateString()}
					</p>
					<p className="text-sm text-gray-400">
						Last updated:{' '}
						{new Date(project.updatedAt).toLocaleDateString()}
					</p>
					{project.description && (
						<p className="text-sm text-gray-600 line-clamp-2">
							{project.description}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	</Link>
));

export default function TeamProjects() {
	const params = useParams();
	const teamId = params.teamId as string;
	const [searchQuery, setSearchQuery] = useState('');
	const { toast } = useToast();
	const { hasPermission } = usePermissions(teamId);

	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: ['teamProjects', teamId],
		queryFn: async () => {
			try {
				// Check if user has permission to view projects
				if (!hasPermission(teamId, 'viewProjects')) {
					throw new Error(
						'You do not have permission to view projects.'
					);
				}

				const res = await axios.get<ApiResponse>(
					`/api/teams/${teamId}/projects`
				);
				console.log('Raw API Response:', res.data); // Debug log

				if (!res.data) {
					console.error('Empty response from server');
					throw new Error('Empty response from server');
				}

				if (!res.data.success) {
					console.error('API returned error:', res.data.error);
					throw new Error(
						res.data.error?.message || 'API returned an error'
					);
				}

				if (!res.data.data || !res.data.data.projects) {
					console.error('Response missing projects array:', res.data);
					throw new Error(
						'Invalid response format: missing projects array'
					);
				}

				if (!Array.isArray(res.data.data.projects)) {
					console.error(
						'Projects is not an array:',
						res.data.data.projects
					);
					throw new Error(
						'Invalid response format: projects is not an array'
					);
				}

				return res.data.data.projects;
			} catch (err) {
				if (axios.isAxiosError(err)) {
					const axiosError = err as AxiosError<{
						error?: {
							code?: string;
							message?: string;
						};
						message?: string;
					}>;

					console.error('Project fetch error:', {
						status: axiosError.response?.status,
						statusText: axiosError.response?.statusText,
						data: axiosError.response?.data,
						message: axiosError.message,
					});

					const errorMessage =
						axiosError.response?.data?.error?.message ||
						axiosError.response?.data?.message ||
						axiosError.response?.statusText ||
						'Failed to fetch projects.';

					throw new Error(errorMessage);
				}

				console.error('Non-Axios error:', err);
				throw new Error(
					'An unexpected error occurred while fetching projects.'
				);
			}
		},
		staleTime: 1000 * 60 * 5, // Cache for 5 minutes
		retry: 2, // Retry failed requests up to 2 times
		refetchOnWindowFocus: false, // Disable automatic refetch on window focus
	});

	const filteredProjects = useMemo(() => {
		if (!data) return [];
		if (!searchQuery) return data;

		const query = searchQuery.toLowerCase();
		return data.filter((project) =>
			project.name.toLowerCase().includes(query)
		);
	}, [data, searchQuery]);

	const handleCreateProject = async () => {
		if (!hasPermission(teamId, 'createProjects')) {
			toast({
				title: 'Permission Denied',
				description: 'You do not have permission to create projects.',
				variant: 'destructive',
			});
			return;
		}

		// TODO: Implement project creation
		toast({
			title: 'Coming Soon',
			description:
				'Project creation functionality will be available soon!',
		});
	};

	if (isLoading) {
		return (
			<div className="p-8 space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-2xl font-bold">Team Projects</h1>
					<Button disabled>
						<Plus className="mr-2 h-4 w-4" />
						Create Project
					</Button>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

	if (isError) {
		return (
			<div className="p-8 space-y-4">
				<div className="flex justify-between items-center">
					<h1 className="text-2xl font-bold">Team Projects</h1>
					{hasPermission(teamId, 'createProjects') && (
						<Button disabled>Create Project</Button>
					)}
				</div>
				<div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
					<p className="text-red-500">{(error as Error).message}</p>
					<Button
						variant="outline"
						onClick={() => refetch()}
						className="mt-2"
					>
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="p-8 space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Team Projects</h1>
				{hasPermission(teamId, 'createProjects') && (
					<Button onClick={handleCreateProject}>
						<Plus className="mr-2 h-4 w-4" />
						Create Project
					</Button>
				)}
			</div>

			<div className="relative">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
				<Input
					type="text"
					placeholder="Search projects..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-10"
				/>
			</div>

			{filteredProjects.length === 0 ? (
				<div className="flex flex-col items-center gap-4 py-12">
					<p className="text-gray-400">
						{searchQuery
							? 'No projects found matching your search.'
							: 'No projects found for this team.'}
					</p>
					{!searchQuery &&
						hasPermission(teamId, 'createProjects') && (
							<Button onClick={handleCreateProject}>
								Create Your First Project
							</Button>
						)}
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{filteredProjects.map((project) => (
						<ProjectCard
							key={project.id}
							project={project}
							whileHover={{ scale: 1.02 }}
							transition={{ duration: 0.2 }}
						/>
					))}
				</div>
			)}
		</div>
	);
}
