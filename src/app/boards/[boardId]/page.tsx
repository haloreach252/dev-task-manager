// page.tsx
'use client';

import { useParams } from 'next/navigation';
import KanbanBoard from './KanbanBoard';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

type Board = {
	id: string;
	name: string;
	visibility: 'PUBLIC' | 'TEAM' | 'PRIVATE';
};

export default function BoardPage() {
	const { boardId } = useParams();
	const { toast } = useToast();
	const [board, setBoard] = useState<Board | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!boardId) return;

		const fetchBoard = async () => {
			try {
				const res = await axios.get(`/api/boards/${boardId}`);
				setBoard(res.data);
			} catch (error) {
				console.error(error);
				toast({
					title: 'Error',
					description: 'Failed to fetch board',
					variant: 'destructive',
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchBoard();
	}, [boardId, toast]);

	if (isLoading) return <p className="p-6">Loading board...</p>;
	if (!board) return <p className="p-6">Board not found.</p>;

	return (
		<div className="min-h-screen flex flex-col bg-gray-100">
			{/* Top Bar */}
			<header className="bg-white shadow-sm px-6 py-4">
				<h1 className="text-3xl font-bold">{board.name}</h1>
			</header>

			{/* Board Content */}
			<main className="p-6 flex-1 overflow-auto">
				<KanbanBoard boardId={boardId as string} />
			</main>
		</div>
	);
}
