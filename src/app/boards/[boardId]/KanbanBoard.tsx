// src/app/boards/[boardId]/KanbanBoard.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useCallback, useState } from 'react';
import {
	DndContext,
	DragEndEvent,
	DragStartEvent,
	DragOverlay,
	useSensor,
	useSensors,
	PointerSensor,
	KeyboardSensor,
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
import TaskDetailsDialog, { TaskDetails } from './TaskDetailsDialog';

// Extend the Prisma Task type to include checklist items
export type Task = TaskDetails; // TaskDetails = Task & { checklistItems: ChecklistItem[] }

export default function KanbanBoard({ boardId }: { boardId: string }) {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
	const [newColumnTitle, setNewColumnTitle] = useState('');
	const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
	const [newTaskTitle, setNewTaskTitle] = useState('');
	const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
	const [activeDraggable, setActiveDraggable] = useState<any>(null);
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				delay: 100,
				tolerance: 5,
			},
		}),
		useSensor(KeyboardSensor)
	);

	const { data: columns = [], isLoading } = useQuery<Column[]>({
		queryKey: ['columns', boardId],
		queryFn: async () => {
			const res = await axios.get(`/api/boards/${boardId}/columns`);
			return res.data;
		},
	});

	// Create Column Mutation
	const createColumn = useMutation({
		mutationFn: async () => {
			const res = await axios.post(`/api/boards/${boardId}/columns`, {
				title: newColumnTitle,
			});
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['columns', boardId] });
			setIsColumnDialogOpen(false);
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

	// Create Task Mutation
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
			setIsTaskDialogOpen(false);
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

	// Task Reorder Mutation (Optimistic)
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

			const insertedTask: Task = {
				...movedTask,
				columnId: targetColumnId,
			};

			const updatedColumns = columnsWithoutTask.map((column) => {
				if (column.id === targetColumnId) {
					const tasks = [...column.tasks];
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

	// Column Reorder Mutation (Optimistic)
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
		setActiveDraggable(event.active.data.current);
	};

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			setActiveDraggable(null);
			if (!over) return;
			const activeData = active.data.current || activeDraggable;
			const overData = over.data.current;
			const activeId = active.id as string;
			if (!activeData) return;

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
		[activeDraggable, reorderColumnMutation, reorderTaskMutation]
	);

	const handleDragCancel = () => {
		setActiveDraggable(null);
	};

	// Handler for opening task details when a task is clicked.
	const handleOpenTask = (task: Task) => {
		setSelectedTask(task);
	};

	// Handler for saving task details.
	const handleSaveTaskDetails = (updatedTask: Task) => {
		axios
			.patch(
				`/api/boards/${boardId}/tasks/${updatedTask.id}/details`,
				updatedTask
			)
			.then(() => {
				queryClient.invalidateQueries({
					queryKey: ['columns', boardId],
				});
				setSelectedTask(null);
				toast({ title: 'Task updated' });
			})
			.catch(() => {
				toast({
					title: 'Error',
					description: 'Failed to update task details',
					variant: 'destructive',
				});
			});
	};

	if (isLoading) return <div className="p-6">Loading...</div>;

	const columnIds = columns.map((col) => col.id);

	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<DndContext
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				onDragCancel={handleDragCancel}
				sensors={sensors}
			>
				<SortableContext
					items={columnIds}
					strategy={horizontalListSortingStrategy}
				>
					<div className="flex gap-4">
						{columns.map((column) => (
							<DraggableKanbanColumn
								key={column.id}
								column={column}
								onAddTask={(columnId) => {
									setActiveColumnId(columnId);
									setIsTaskDialogOpen(true);
								}}
								onOpenTask={handleOpenTask}
							/>
						))}

						{/* Add Column Button placed to the far right */}
						<Dialog
							open={isColumnDialogOpen}
							onOpenChange={setIsColumnDialogOpen}
						>
							<DialogTrigger asChild>
								<Button
									variant="ghost"
									className="h-fit self-start mt-1"
								>
									<Plus className="mr-1 w-4 h-4" />
									Add Column
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>New Column</DialogTitle>
								</DialogHeader>
								<Input
									value={newColumnTitle}
									onChange={(e) =>
										setNewColumnTitle(e.target.value)
									}
									placeholder="Column title"
								/>
								<DialogFooter>
									<Button
										onClick={() => createColumn.mutate()}
									>
										Create
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				</SortableContext>

				<DragOverlay
					dropAnimation={{ duration: 250, easing: 'ease-out' }}
					style={{ zIndex: 1000 }}
				>
					{activeDraggable ? (
						activeDraggable.type === 'task' ? (
							<div className="w-64 p-2 bg-white shadow rounded cursor-grab">
								{activeDraggable.title}
							</div>
						) : activeDraggable.type === 'column' ? (
							<div className="w-80 bg-gray-50 rounded shadow p-4 cursor-grab">
								<h2 className="pb-2 mb-2 border-b border-gray-300 text-xl font-bold">
									{activeDraggable.title}
								</h2>
							</div>
						) : null
					) : null}
				</DragOverlay>
			</DndContext>

			{/* Add Task Dialog */}
			<Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
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

			{/* Advanced Task Details Dialog */}
			{selectedTask && (
				<TaskDetailsDialog
					task={selectedTask}
					onClose={() => setSelectedTask(null)}
					onSave={handleSaveTaskDetails}
				/>
			)}
		</div>
	);
}
