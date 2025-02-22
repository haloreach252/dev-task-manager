'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Task = {
	id: string;
	title: string;
	order: number;
	columnId: string;
};

type Column = {
	id: string;
	title: string;
	order: number;
	tasks: Task[];
};

export default function KanbanBoard({ boardId }: { boardId: string }) {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [newColumnTitle, setNewColumnTitle] = useState('');
	const [taskDialogOpen, setTaskDialogOpen] = useState(false);
	const [newTaskTitle, setNewTaskTitle] = useState('');
	const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

	const { data: columns = [], isLoading } = useQuery({
		queryKey: ['columns', boardId],
		queryFn: async () => {
			const res = await axios.get(`/api/boards/${boardId}/columns`);
			return res.data;
		},
	});

	// Create Column
	const createColumn = useMutation({
		mutationFn: async () => {
			const res = await axios.post(`/api/boards/${boardId}/columns`, {
				title: newColumnTitle,
			});
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['columns', boardId] });
			setIsDialogOpen(false);
			setNewColumnTitle('');
			toast({ title: 'Column created' });
		},
		onError: () => {
			toast({
				title: 'Error',
				description: 'Failed to create column.',
				variant: 'destructive',
			});
		},
	});

	// Create Task
	const createTask = useMutation({
		mutationFn: async () => {
			const res = await axios.post(`/api/boards/${boardId}/tasks`, {
				title: newTaskTitle,
				columnId: activeColumnId,
			});
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['columns', boardId] });
			setTaskDialogOpen(false);
			setNewTaskTitle('');
			toast({ title: 'Task created' });
		},
		onError: () => {
			toast({
				title: 'Error',
				description: 'Failed to create task.',
				variant: 'destructive',
			});
		},
	});

	// Reorder Task (move within or between columns)
	const handleReorderTask = async (
		draggedId: string,
		targetId: string,
		targetColumnId: string
	) => {
		try {
			await axios.put(`/api/boards/${boardId}/tasks/${draggedId}`, {
				targetId,
				targetColumnId,
			});
			queryClient.invalidateQueries({ queryKey: ['columns', boardId] });
		} catch (error) {
			console.error(error);
			toast({
				title: 'Error',
				description: 'Failed to reorder tasks.',
				variant: 'destructive',
			});
		}
	};

	// Reorder Column
	const handleReorderColumn = async (
		draggedColumnId: string,
		targetColumnId: string
	) => {
		try {
			await axios.put(
				`/api/boards/${boardId}/columns/${draggedColumnId}/reorder`,
				{
					targetColumnId,
				}
			);
			queryClient.invalidateQueries({ queryKey: ['columns', boardId] });
		} catch (error) {
			console.error(error);
			toast({
				title: 'Error',
				description: 'Failed to reorder columns.',
				variant: 'destructive',
			});
		}
	};

	useEffect(() => {
		// Setup drag-and-drop for tasks
		columns.forEach((column: Column) => {
			column.tasks.forEach((task) => {
				const element = document.getElementById(task.id);
				if (element) {
					draggable({
						element,
						getInitialData: () => ({
							id: task.id,
							columnId: task.columnId,
						}),
					});

					dropTargetForElements({
						element,
						getData: () => ({
							id: task.id,
							columnId: task.columnId,
							type: 'TASK',
						}),
						onDrop: ({ source }) => {
							const draggedId = source.data.id;
							const sourceColumnId = source.data.columnId;
							const targetColumnId = task.columnId;
							if (
								draggedId !== task.id ||
								sourceColumnId !== targetColumnId
							) {
								handleReorderTask(
									draggedId,
									task.id,
									targetColumnId
								);
							}
						},
					});
				}
			});

			// Setup drag-and-drop for columns
			const columnElement = document.getElementById(
				`column-${column.id}`
			);
			if (columnElement) {
				draggable({
					element: columnElement,
					getInitialData: () => ({
						id: column.id,
						type: 'COLUMN',
					}),
				});

				dropTargetForElements({
					element: columnElement,
					getData: () => ({ id: column.id, type: 'COLUMN' }),
					onDrop: ({ source }) => {
						const draggedColumnId = source.data.id;
						const targetColumnId = column.id;
						if (draggedColumnId !== targetColumnId) {
							handleReorderColumn(
								draggedColumnId,
								targetColumnId
							);
						}
					},
				});
			}
		});
	}, [columns]);

	return (
		<div>
			<div className="flex space-x-4 overflow-x-auto">
				{isLoading ? (
					<p>Loading columns...</p>
				) : (
					columns.map((column: Column) => (
						<div
							key={column.id}
							id={`column-${column.id}`}
							className="w-72 bg-gray-900 text-white rounded-lg p-4 flex-shrink-0"
						>
							<h3 className="text-lg font-semibold mb-4">
								{column.title}
							</h3>
							<div className="space-y-2">
								{column.tasks.map((task) => (
									<Card
										key={task.id}
										id={task.id}
										className="p-4 bg-gray-700 text-white cursor-pointer"
									>
										{task.title}
									</Card>
								))}
							</div>

							{/* Add Task Button */}
							<Button
								className="w-full mt-4"
								variant="secondary"
								onClick={() => {
									setActiveColumnId(column.id);
									setTaskDialogOpen(true);
								}}
							>
								<Plus className="mr-2" /> Add Task
							</Button>
						</div>
					))
				)}

				{/* Add Column Button */}
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<div className="w-72 h-full bg-gray-800 text-gray-300 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:bg-gray-700">
							<Plus className="mr-2" /> Add Column
						</div>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New Column</DialogTitle>
						</DialogHeader>
						<Input
							placeholder="Column Name"
							value={newColumnTitle}
							onChange={(e) => setNewColumnTitle(e.target.value)}
						/>
						<DialogFooter>
							<Button
								onClick={() => createColumn.mutate()}
								disabled={!newColumnTitle}
							>
								Create
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Create Task Dialog */}
			<Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Task</DialogTitle>
					</DialogHeader>
					<Input
						placeholder="Task Name"
						value={newTaskTitle}
						onChange={(e) => setNewTaskTitle(e.target.value)}
					/>
					<DialogFooter>
						<Button
							onClick={() => createTask.mutate()}
							disabled={!newTaskTitle}
						>
							Create Task
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
