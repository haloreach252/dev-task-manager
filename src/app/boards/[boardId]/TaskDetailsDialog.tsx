// src/app/boards/[boardId]/TaskDetailsDialog.tsx

/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { type Task, type ChecklistItem } from '@prisma/client';

export type TaskDetails = Task & {
	checklistItems: ChecklistItem[];
};

interface TaskDetailsDialogProps {
	task: TaskDetails;
	onClose: () => void;
	onSave: (updatedTask: TaskDetails) => void;
}

const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
	task,
	onClose,
	onSave,
}) => {
	const initialDueDate = task.dueDate
		? new Date(task.dueDate).toISOString().substring(0, 10)
		: '';
	const [title, setTitle] = useState(task.title);
	const [description, setDescription] = useState(task.description || '');
	const [dueDate, setDueDate] = useState(initialDueDate);
	const [checklist, setChecklist] = useState<ChecklistItem[]>(
		task.checklistItems || []
	);

	useEffect(() => {
		setTitle(task.title);
		setDescription(task.description || '');
		setDueDate(
			task.dueDate
				? new Date(task.dueDate).toISOString().substring(0, 10)
				: ''
		);
		setChecklist(task.checklistItems || []);
	}, [task]);

	const addChecklistItem = () => {
		// Generate a temporary ID; The backend will assign a real one
		const tempId = Date.now().toString();
		setChecklist([
			...checklist,
			{
				id: tempId,
				text: '',
				completed: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				taskId: task.id,
			},
		]);
	};

	const updateChecklistItem = (id: string, text: string) => {
		setChecklist(
			checklist.map((item) => (item.id === id ? { ...item, text } : item))
		);
	};

	const toggleChecklistItem = (id: string) => {
		setChecklist(
			checklist.map((item) =>
				item.id === id ? { ...item, completed: !item.completed } : item
			)
		);
	};

	const handleSave = () => {
		const updatedDueDate = dueDate ? new Date(dueDate) : null;

		onSave({
			...task,
			title,
			description,
			dueDate: updatedDueDate,
			checklistItems: checklist,
		});
	};

	return (
		<Dialog
			open
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent className="w-[90vw] max-w-2xl">
				<DialogHeader>
					<DialogTitle>Edit Task</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Title
						</label>
						<Input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="mt-1"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Description
						</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
							rows={4}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Due Date
						</label>
						<Input
							type="date"
							value={dueDate}
							onChange={(e) => setDueDate(e.target.value)}
							className="mt-1"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Checklist
						</label>
						<div className="mt-1 space-y-2">
							{checklist.map((item) => (
								<div
									key={item.id}
									className="flex items-center space-x-2"
								>
									<input
										type="checkbox"
										checked={item.completed}
										onChange={() =>
											toggleChecklistItem(item.id)
										}
										className="h-4 w-4"
									/>
									<Input
										value={item.text}
										onChange={(e) =>
											updateChecklistItem(
												item.id,
												e.target.value
											)
										}
										className="flex-1"
									/>
								</div>
							))}
							<Button
								variant="ghost"
								size="sm"
								onClick={addChecklistItem}
							>
								+ Add Item
							</Button>
						</div>
					</div>
				</div>
				<DialogFooter className="mt-4">
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleSave}>Save</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default TaskDetailsDialog;
