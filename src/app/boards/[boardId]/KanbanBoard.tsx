/* eslint-disable @typescript-eslint/no-explicit-any */
// KanbanBoard.tsx
'use client';

import React, { useCallback } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import {
	SortableContext,
	horizontalListSortingStrategy,
	arrayMove,
} from '@dnd-kit/sortable';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import DraggableKanbanColumn from './DraggableKanbanColumn';

export type Task = {
	id: string;
	title: string;
	order: number;
	columnId: string;
};

export type Column = {
	id: string;
	title: string;
	order: number;
	tasks: Task[];
};

export default function KanbanBoard({ boardId }: { boardId: string }) {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const [isDialogOpen, setIsDialogOpen] = React.useState(false);
	const [newColumnTitle, setNewColumnTitle] = React.useState('');
	const [taskDialogOpen, setTaskDialogOpen] = React.useState(false);
	const [newTaskTitle, setNewTaskTitle] = React.useState('');
	const [activeColumnId, setActiveColumnId] = React.useState<string | null>(
		null
	);

	const { data: columns = [], isLoading } = useQuery<Column[]>({
		queryKey: ['columns', boardId],
		queryFn: async () => {
			const res = await axios.get(`/api/boards/${boardId}/columns`);
			return res.data;
		},
	});

	// Optimistic update for task reordering/moving between columns.
	const reorderTaskMutation = useMutation({
		mutationFn: async ({
			taskId,
			targetId,
			targetColumnId,
		}: {
			taskId: string;
			targetId: string | null;
			targetColumnId: string;
		}) => {
			const res = await axios.put(
				`/api/boards/${boardId}/tasks/${taskId}`,
				{
					targetId,
					targetColumnId,
				}
			);
			return res.data;
		},
		onMutate: async ({ taskId, targetId, targetColumnId }) => {
			// Cancel ongoing fetches
			await queryClient.cancelQueries({ queryKey: ['columns', boardId] });
			// Snapshot previous state
			const previousColumns = queryClient.getQueryData<Column[]>([
				'columns',
				boardId,
			]);
			if (!previousColumns) return { previousColumns };

			// Create a new state by:
			// 1. Removing the task from its original column.
			// 2. Inserting it into the target column at the proper position.
			const newColumns = previousColumns.map((column) => {
				let tasks = [...column.tasks];
				// If this column contains the task, remove it.
				const removedTask = tasks.find((task) => task.id === taskId);
				tasks = tasks.filter((task) => task.id !== taskId);
				// If this is the target column, insert the removed task.
				if (column.id === targetColumnId && removedTask) {
					const movedTask = {
						...removedTask,
						columnId: targetColumnId,
					};
					if (targetId) {
						const targetIndex = tasks.findIndex(
							(t) => t.id === targetId
						);
						if (targetIndex === -1) {
							tasks.push(movedTask);
						} else {
							tasks.splice(targetIndex + 1, 0, movedTask);
						}
					} else {
						tasks.push(movedTask);
					}
				}
				return { ...column, tasks };
			});
			queryClient.setQueryData(['columns', boardId], newColumns);
			return { previousColumns };
		},
		onError: (err, variables, context: any) => {
			// Roll back if mutation fails.
			queryClient.setQueryData(
				['columns', boardId],
				context.previousColumns
			);
		},
		onSettled: () => {
			// Always re-fetch after mutation.
			queryClient.invalidateQueries({ queryKey: ['columns', boardId] });
		},
	});

	// Optimistic update for column reordering.
	const reorderColumnMutation = useMutation({
		mutationFn: async ({
			columnId,
			targetColumnId,
		}: {
			columnId: string;
			targetColumnId: string;
		}) => {
			const res = await axios.put(
				`/api/boards/${boardId}/columns/${columnId}/reorder`,
				{ targetColumnId }
			);
			return res.data;
		},
		onMutate: async ({ columnId, targetColumnId }) => {
			await queryClient.cancelQueries({ queryKey: ['columns', boardId] });
			const previousColumns = queryClient.getQueryData<Column[]>([
				'columns',
				boardId,
			]);
			if (!previousColumns) return { previousColumns };

			const draggedIndex = previousColumns.findIndex(
				(c) => c.id === columnId
			);
			const targetIndex = previousColumns.findIndex(
				(c) => c.id === targetColumnId
			);
			const newColumns = arrayMove(
				previousColumns,
				draggedIndex,
				targetIndex
			);
			queryClient.setQueryData(['columns', boardId], newColumns);
			return { previousColumns };
		},
		onError: (err, variables, context: any) => {
			queryClient.setQueryData(
				['columns', boardId],
				context.previousColumns
			);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['columns', boardId] });
		},
	});

	// onDragEnd: Distinguish between task and column drags.
	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			if (!over) return;
			const activeData = active.data.current;
			const overData = over.data.current;
			const activeId = active.id as string;

			if (activeData?.type === 'column') {
				// For column drags, assume over.id is the target column's id.
				const draggedColumnId = activeId;
				const targetColumnId = over.id as string;
				if (draggedColumnId !== targetColumnId) {
					reorderColumnMutation.mutate({
						columnId: draggedColumnId,
						targetColumnId,
					});
				}
			} else if (activeData?.type === 'task') {
				// For tasks, use custom data to determine the source and target.
				const sourceColumnId = activeData.columnId;
				let targetColumnId: string;
				let targetTaskId: string | null = null;
				if (overData?.type === 'column') {
					// Dropped into an empty column.
					targetColumnId = overData.columnId;
					targetTaskId = null;
				} else if (overData?.type === 'task') {
					targetColumnId = overData.columnId;
					targetTaskId = over.id as string;
				} else {
					return;
				}
				if (
					sourceColumnId === targetColumnId &&
					activeId === targetTaskId
				)
					return;
				reorderTaskMutation.mutate({
					taskId: activeId,
					targetId: targetTaskId,
					targetColumnId,
				});
			}
		},
		[reorderTaskMutation, reorderColumnMutation]
	);

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

	if (isLoading) return <div>Loading...</div>;

	const columnIds = columns.map((col) => col.id);

	return (
		<DndContext onDragEnd={handleDragEnd}>
			<SortableContext
				items={columnIds}
				strategy={horizontalListSortingStrategy}
			>
				<div className="flex overflow-x-auto space-x-4 p-4">
					{columns.map((column) => (
						<DraggableKanbanColumn
							key={column.id}
							column={column}
							onAddTask={(columnId) => {
								setActiveColumnId(columnId);
								setTaskDialogOpen(true);
							}}
						/>
					))}
				</div>
			</SortableContext>

			{/* Add Column Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogTrigger asChild>
					<Button>
						<Plus /> Add Column
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>New Column</DialogTitle>
					</DialogHeader>
					<Input
						value={newColumnTitle}
						onChange={(e) => setNewColumnTitle(e.target.value)}
						placeholder="Column title"
					/>
					<DialogFooter>
						<Button onClick={() => createColumn.mutate()}>
							Create
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Add Task Dialog */}
			<Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>New Task</DialogTitle>
					</DialogHeader>
					<Input
						value={newTaskTitle}
						onChange={(e) => setNewTaskTitle(e.target.value)}
						placeholder="Task title"
					/>
					<DialogFooter>
						<Button onClick={() => createTask.mutate()}>
							Create
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</DndContext>
	);
}
