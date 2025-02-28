'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

type Project = { id: string; name: string };

export default function TeamProjects() {
	const params = useParams();
	const teamId = params.teamId as string;

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['teamProjects', teamId],
		queryFn: async () => {
			try {
				const res = await axios.get(`/api/teams/${teamId}/projects`);
				return res.data.projects as Project[];
			} catch (err: any) {
				throw new Error(
					err.response?.data?.error || 'An unexpected error occurred.'
				);
			}
		},
	});

	if (isLoading) {
		return (
			<div className="p-8">
				<h1 className="text-2xl font-bold mb-4">Team Projects</h1>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{[...Array(6)].map((_, i) => (
						<Skeleton key={i} className="h-24 w-full bg-gray-700" />
					))}
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="p-8">
				<h1 className="text-2xl font-bold mb-4">Team Projects</h1>
				<p className="text-red-500">{(error as Error).message}</p>
			</div>
		);
	}

	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-4">Team Projects</h1>

			{data?.length === 0 ? (
				<div className="flex flex-col items-center gap-4">
					<p className="text-gray-400">
						No projects found for this team.
					</p>
					<Button variant="default">Create New Project</Button>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{data?.map((project) => (
						<motion.div
							key={project.id}
							whileHover={{ scale: 1.02 }}
							transition={{ duration: 0.2 }}
						>
							<Link href={`/projects/${project.id}`}>
								<Card className="hover:shadow-lg cursor-pointer">
									<CardHeader>
										<CardTitle>{project.name}</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-gray-400">
											Click to view project details
										</p>
									</CardContent>
								</Card>
							</Link>
						</motion.div>
					))}
				</div>
			)}
		</div>
	);
}
