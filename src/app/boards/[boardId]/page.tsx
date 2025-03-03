// src/app/boards/[boardId]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useToast } from '@/hooks/use-toast';
import KanbanBoard from './KanbanBoard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type Board = {
	id: string;
	name: string;
	visibility: 'PUBLIC' | 'TEAM' | 'PRIVATE';
};

export default function BoardPage() {
	const { boardId } = useParams();
	const { toast } = useToast();
	const router = useRouter();

	// Fetch board data using React Query
	const {
		data: board,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ['board', boardId],
		queryFn: async () => {
			const { data } = await axios.get(`/api/boards/${boardId}`);
			return data as Board;
		},
		retry: false,
	});

	// Loading UI (Skeletons)
	if (isLoading) {
		return (
			<div className="p-6">
				<Skeleton className="h-10 w-3/4 mb-4" />
				<Skeleton className="h-8 w-1/2" />
			</div>
		);
	}

	// Error Handling
	let errorMessage = 'Failed to fetch board';
	let isForbidden = false;

	if (error instanceof AxiosError && error.response) {
		errorMessage = error.response.data?.error || errorMessage;
		isForbidden = error.response.status === 403;
	}

	if (isError) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-6">
				<Alert variant="destructive" className="max-w-md text-center">
					<AlertTitle>
						{isForbidden ? 'Access Denied' : 'Board Not Found'}
					</AlertTitle>
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
				<Button className="mt-6" onClick={() => router.back()}>
					Go Back
				</Button>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col bg-gray-100">
			{/* Top Bar */}
			<header className="bg-white shadow-sm px-6 py-4">
				<h1 className="text-3xl font-bold">{board?.name}</h1>
			</header>

			{/* Board Content */}
			<main className="p-6 flex-1 overflow-auto">
				<KanbanBoard boardId={boardId as string} />
			</main>
		</div>
	);
}
