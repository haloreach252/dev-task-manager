'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
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
import { useToast } from '@/hooks/use-toast';

type Board = {
	id: string;
	name: string;
	visibility: 'PUBLIC' | 'TEAM' | 'PRIVATE';
};

export default function ProjectBoardsPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { projectId } = useParams(); // ✅ useParams hook
	const { toast } = useToast();

	const [boards, setBoards] = useState<Board[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [newBoardName, setNewBoardName] = useState('');
	const [visibility, setVisibility] = useState<'PUBLIC' | 'TEAM' | 'PRIVATE'>(
		'PRIVATE'
	);

	useEffect(() => {
		if (!projectId) return;

		const fetchBoards = async () => {
			try {
				const res = await axios.get(
					`/api/projects/${projectId}/boards`
				);
				setBoards(res.data);
			} catch (error) {
				console.error(error);
				toast({
					title: 'Error',
					description: 'Failed to fetch boards.',
					variant: 'destructive',
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchBoards();
	}, [projectId, toast]);

	const handleBoardClick = (boardId: string) => {
		router.push(`/boards/${boardId}`);
	};

	const createBoard = async () => {
		if (!newBoardName) return;

		try {
			const res = await axios.post(`/api/projects/${projectId}/boards`, {
				name: newBoardName,
				visibility,
			});
			setBoards((prev) => [...prev, res.data]);
			setIsDialogOpen(false);
			setNewBoardName('');
			toast({
				title: 'Board Created',
				description: 'The board was successfully created.',
			});
		} catch (error) {
			console.error(error);
			toast({
				title: 'Error',
				description: 'Failed to create board.',
				variant: 'destructive',
			});
		}
	};

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Project Boards</h1>
				<Button onClick={() => setIsDialogOpen(true)}>
					Create New Board
				</Button>
			</div>

			{isLoading ? (
				<p>Loading boards...</p>
			) : boards.length ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{boards.map((board) => (
						<Card
							key={board.id}
							className="p-4 hover:bg-gray-100 cursor-pointer"
							onClick={() => handleBoardClick(board.id)}
						>
							<h3 className="text-lg font-semibold">
								{board.name}
							</h3>
							<p className="text-sm text-gray-600">
								Visibility: {board.visibility}
							</p>
						</Card>
					))}
				</div>
			) : (
				<p>No boards found. Create one to get started!</p>
			)}

			{/* Create Board Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Board</DialogTitle>
					</DialogHeader>

					<Input
						placeholder="Board Name"
						value={newBoardName}
						onChange={(e) => setNewBoardName(e.target.value)}
					/>

					<DialogFooter>
						<Button onClick={createBoard} disabled={!newBoardName}>
							Create
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
