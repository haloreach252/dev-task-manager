// src/app/boards/[boardId]/TaskDetailsDialog.tsx

'use client';

import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Plus,
	Trash,
	Paperclip,
	Calendar,
	Tag,
	CheckSquare,
} from 'lucide-react';
import {
	type Task,
	type ChecklistItem,
	type FileAttachment,
	type Label,
} from '@prisma/client';
import axios from 'axios';

export type TaskDetails = Task & {
	// Now tasks have multiple checklists rather than a flat array of checklist items.
	checklists: {
		id: string;
		name: string;
		items: ChecklistItem[];
	}[];
	attachments: FileAttachment[];
	// Note: In your schema, labels are stored via a join table (TaskLabel).
	// For this UI, ensure your task query returns an array of Label objects.
	labels: Label[];
};

interface TaskDetailsDialogProps {
	task: TaskDetails;
	onClose: () => void;
	onSave: (updatedTask: TaskDetails) => void;
	boardId: string;
}

const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
	task,
	onClose,
	onSave,
	boardId
}) => {
	const initialDueDate = task.dueDate
		? new Date(task.dueDate).toISOString().substring(0, 10)
		: '';
	const [title, setTitle] = useState(task.title);
	const [description, setDescription] = useState(task.description || '');
	const [dueDate, setDueDate] = useState(initialDueDate);
	// Updated state: now an array of checklists.
	const [checklists, setChecklists] = useState<
		{ id: string; name: string; items: ChecklistItem[] }[]
	>(task.checklists || []);
	const [attachments, setAttachments] = useState<FileAttachment[]>(
		task.attachments || []
	);
	const [labels, setLabels] = useState<Label[]>(task.labels || []);
	const [hasDueDate, setHasDueDate] = useState(task.dueDate ? true : false);
	const [hasChecklist, setHasChecklist] = useState(checklists.length ? true : false);
	const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);

	useEffect(() => {
		setTitle(task.title);
		setDescription(task.description || '');
		setDueDate(
			task.dueDate
				? new Date(task.dueDate).toISOString().substring(0, 10)
				: ''
		);
		setChecklists(task.checklists || []);
		setAttachments(task.attachments || []);
		setLabels(task.labels || []);
	}, [task]);

	const handleSelectLabel = async (label: Label) => {
		await axios.post(`/api/boards/${boardId}/tasks/${task.id}/labels`, {
			labelId: label.id,
			action: 'add'
		});

		setLabels([...labels, label]);
	}

	const handleDeselectLabel = async (labelId: string) => {
		await axios.post(`/api/boards/${boardId}/tasks/${task.id}/labels`, {
			labelId,
			action: 'remove'
		});

		setLabels(labels.filter((l) => l.id !== labelId));
	}

	// Handler to add a new (empty) checklist.
	const addChecklist = () => {
		setHasChecklist(true);
		const newChecklist = {
			id: Date.now().toString(),
			name: 'New Checklist',
			items: [] as ChecklistItem[],
		};
		setChecklists([...checklists, newChecklist]);
	};

	// Handler to update a checklist's name.
	const updateChecklistName = (checklistId: string, newName: string) => {
		setChecklists(
			checklists.map((cl) =>
				cl.id === checklistId ? { ...cl, name: newName } : cl
			)
		);
	};

	// Handler to add an item to a specific checklist.
	const addChecklistItem = (checklistId: string) => {
		setChecklists(
			checklists.map((cl) => {
				if (cl.id === checklistId) {
					const newItem: ChecklistItem = {
						id: Date.now().toString(),
						text: '',
						completed: false,
						createdAt: new Date(),
						updatedAt: new Date(),
						checklistId,
						// The checklist relation should be set on the backend.
						// Here we assume the API will use the checklist's id.
						// If needed, you can add a property like checklistId.
					};
					return { ...cl, items: [...cl.items, newItem] };
				}
				return cl;
			})
		);
	};

	const updateChecklistItem = (
		checklistId: string,
		itemId: string,
		text: string
	) => {
		setChecklists(
			checklists.map((cl) => {
				if (cl.id === checklistId) {
					return {
						...cl,
						items: cl.items.map((item) =>
							item.id === itemId ? { ...item, text } : item
						),
					};
				}
				return cl;
			})
		);
	};

	const toggleChecklistItem = (checklistId: string, itemId: string) => {
		setChecklists(
			checklists.map((cl) => {
				if (cl.id === checklistId) {
					return {
						...cl,
						items: cl.items.map((item) =>
							item.id === itemId
								? { ...item, completed: !item.completed }
								: item
						),
					};
				}
				return cl;
			})
		);
	};

	const removeChecklistItem = (checklistId: string, itemId: string) => {
		setChecklists(
			checklists.map((cl) => {
				if (cl.id === checklistId) {
					return {
						...cl,
						items: cl.items.filter((item) => item.id !== itemId),
					};
				}
				return cl;
			})
		);

		if (checklists.length === 0) {
			setHasChecklist(false);
		}
	};

	const addAttachment = (file: File) => {
		const newAttachment: FileAttachment = {
			id: Date.now().toString(),
			fileName: file.name,
			fileUrl: URL.createObjectURL(file),
			fileType: file.type,
			fileSize: file.size,
			createdAt: new Date(),
			taskId: task.id,
			uploadedById: null,
		};
		setAttachments([...attachments, newAttachment]);
	};

	const handleSave = () => {
		onSave({
			...task,
			title,
			description,
			dueDate: dueDate ? new Date(dueDate) : null,
			checklists,
			attachments,
			labels,
		});
		onClose();
	};

	const handleAddDueDate = () => {
		const today = new Date().toISOString().substring(0, 10); // Format to 'YYYY-MM-DD'
		setDueDate(today);
		setHasDueDate(true);
	};

	return (
		<Dialog open onOpenChange={onClose}>
			<DialogContent className="flex flex-col md:flex-row max-w-4xl">
				{/* Main Content */}
				<div className="flex-1 p-4">
					<DialogHeader>
						<DialogTitle>
							<Input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Task Title"
							/>
						</DialogTitle>
					</DialogHeader>

					<Textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Add a description..."
						className="my-4"
					/>

					<div className='my-4'>
						<h3 className='font-bold mb-2'>Labels</h3>
						{labels.map((label: Label) => (
							<span
								key={label.id}
								className='px-2 py-1 rounded-lg text-sm font-semibold'
								style={{ backgroundColor: label.backgroundColor }}
							>
								{label.name}
							</span>
						))}
						
					</div>

					{/* Due Date */}
					{hasDueDate && (
						<div className="my-4">
							<label className="flex items-center gap-2">
								<Calendar className="w-5 h-5" />
								<input
									type="date"
									value={dueDate}
									onChange={(e) => setDueDate(e.target.value)}
									className="border rounded p-1"
								/>
							</label>
						</div>
					)}
					
					{/* Multiple Checklists */}
					{hasChecklist && (
						<div className="my-4">
							<h3 className="font-bold mb-2">Checklists</h3>
							{checklists.map((cl) => (
								<div key={cl.id} className="mb-4 border p-2">
									<Input
										value={cl.name}
										onChange={(e) =>
											updateChecklistName(
												cl.id,
												e.target.value
											)
										}
										placeholder="Checklist name"
										className="mb-2"
									/>
									{cl.items.map((item) => (
										<div
											key={item.id}
											className="flex items-center gap-2 mb-2"
										>
											<Checkbox
												checked={item.completed}
												onCheckedChange={() =>
													toggleChecklistItem(
														cl.id,
														item.id
													)
												}
											/>
											<Input
												value={item.text}
												onChange={(e) =>
													updateChecklistItem(
														cl.id,
														item.id,
														e.target.value
													)
												}
												placeholder="Checklist item"
											/>
											<Button
												variant="ghost"
												onClick={() =>
													removeChecklistItem(
														cl.id,
														item.id
													)
												}
											>
												<Trash className="w-4 h-4" />
											</Button>
										</div>
									))}
									<Button
										variant="outline"
										onClick={() => addChecklistItem(cl.id)}
									>
										<Plus className="w-4 h-4 mr-1" /> Add
										Checklist Item
									</Button>
								</div>
							))}
							<Button variant="outline" onClick={addChecklist}>
								<Plus className="w-4 h-4 mr-1" /> Add New Checklist
							</Button>
						</div>
					)}
					

					{/* Attachments */}
					<div className="my-4">
						<h3 className="font-bold mb-2">Attachments</h3>
						<input
							type="file"
							onChange={(e) =>
								e.target.files &&
								addAttachment(e.target.files[0])
							}
						/>
						<ul className="mt-2">
							{attachments.map((file) => (
								<li key={file.id}>
									<a
										href={file.fileUrl}
										target="_blank"
										rel="noopener noreferrer"
									>
										{file.fileName}
									</a>
								</li>
							))}
						</ul>
					</div>

					<DialogFooter>
						<Button onClick={handleSave}>Save</Button>
						<Button variant="outline" onClick={onClose}>
							Cancel
						</Button>
					</DialogFooter>
				</div>

				{/* Sidebar */}
				<div className="w-full md:w-64 border-l p-4 space-y-2">
					<h3 className="font-bold">Actions</h3>
					<Button variant="outline" onClick={addChecklist}>
						<CheckSquare className="w-4 h-4 mr-2" /> Add Checklist
					</Button>
					<Button variant="outline" onClick={handleAddDueDate}>
						<Calendar className="w-4 h-4 mr-2" /> Set Due Date
					</Button>
					<Button variant="outline">
						<Paperclip className="w-4 h-4 mr-2" /> Attach File
					</Button>
					<Button variant="outline">
						<Tag className="w-4 h-4 mr-2" /> Add Label
					</Button>
					<Button variant="destructive">
						<Trash className="w-4 h-4 mr-2" /> Delete Task
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default TaskDetailsDialog;
