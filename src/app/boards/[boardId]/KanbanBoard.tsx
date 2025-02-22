/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// KanbanBoard.tsx
'use client';

import React, { useCallback, useState } from 'react';
import {
	DndContext,
	DragEndEvent,
	DragStartEvent,
	DragOverlay,
} from '@dnd-kit/core';
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
import { Column } from './KanbanColumn';
import { Task } from './KanbanTask';

export default function KanbanBoard({ boardId }: { boardId: string }) {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [newColumnTitle, setNewColumnTitle] = useState('');
	const [taskDialogOpen, setTaskDialogOpen] = useState(false);
	const [newTaskTitle, setNewTaskTitle] = useState('');
	const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
	// Use state (not a ref) for the active draggable data.
	const [activeDraggable, setActiveDraggable] = useState<any>(null);

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
			await queryClient.cancelQueries({ queryKey: ['columns', boardId] });
			const previousColumns = queryClient.getQueryData<Column[]>([
				'columns',
				boardId,
			]);
			if (!previousColumns) return { previousColumns };

			// Remove the task from its current column and capture its data.
			let movedTask: Task | undefined;
			const columnsWithoutTask = previousColumns.map((column) => {
				const foundTask = column.tasks.find(
					(task) => task.id === taskId
				);
				if (foundTask) {
					movedTask = foundTask;
					return {
						...column,
						tasks: column.tasks.filter((t) => t.id !== taskId),
					};
				}
				return column;
			});
			if (!movedTask) return { previousColumns };

			// Insert the moved task into the target column.
			const updatedColumns = columnsWithoutTask.map((column) => {
				if (column.id === targetColumnId) {
					const tasks = [...column.tasks];
					const insertedTask = {
						...movedTask,
						columnId: targetColumnId,
					};
					if (targetId) {
						const targetIndex = tasks.findIndex(
							(t) => t.id === targetId
						);
						if (targetIndex === -1) {
							tasks.push(insertedTask);
						} else {
							tasks.splice(targetIndex + 1, 0, insertedTask);
						}
					} else {
						tasks.push(insertedTask);
					}
					return { ...column, tasks };
				}
				return column;
			});
			queryClient.setQueryData(['columns', boardId], updatedColumns);
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

	const handleDragStart = (event: DragStartEvent) => {
		// Update active draggable state so DragOverlay renders immediately.
		setActiveDraggable(event.active.data.current);
	};

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			setActiveDraggable(null);
			if (!over) return;

			// Use active.data.current if available; fallback to activeDraggable state.
			const activeData = active.data.current || activeDraggable;
			const overData = over.data.current;
			const activeId = active.id as string;

			console.log('Drag End:', {
				activeData,
				overData,
				activeId,
				overId: over.id,
			});

			if (!activeData) {
				console.warn('No active data available');
				return;
			}

			if (activeData?.type === 'column') {
				const draggedColumnId = activeId;
				const targetColumnId = over.id as string;
				if (draggedColumnId !== targetColumnId) {
					reorderColumnMutation.mutate({
						columnId: draggedColumnId,
						targetColumnId,
					});
				}
			} else if (activeData?.type === 'task') {
				const sourceColumnId = activeData.columnId;
				let targetColumnId: string;
				let targetTaskId: string | null = null;

				if (overData?.type === 'column') {
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
		[reorderTaskMutation, reorderColumnMutation, activeDraggable]
	);

	const handleDragCancel = () => {
		setActiveDraggable(null);
	};

	if (isLoading) return <div>Loading...</div>;

	const columnIds = columns.map((col) => col.id);

	return (
		<DndContext
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDragCancel={handleDragCancel}
		>
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

			<DragOverlay
				dropAnimation={{
					duration: 250,
					easing: 'ease-out',
				}}
				// Ensure the overlay is rendered above everything else.
				style={{ zIndex: 1000 }}
			>
				{activeDraggable ? (
					activeDraggable.type === 'task' ? (
						<div className="mb-2 p-2 bg-white shadow rounded cursor-grab">
							{activeDraggable.title}
						</div>
					) : activeDraggable.type === 'column' ? (
						<div className="w-64 bg-gray-100 rounded p-2 cursor-grab">
							<h2 className="font-bold mb-2">
								{activeDraggable.title}
							</h2>
						</div>
					) : null
				) : null}
			</DragOverlay>

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
						<Button /* onClick={createColumn.mutate} */>
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
						<Button /* onClick={createTask.mutate} */>
							Create
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</DndContext>
	);
}
