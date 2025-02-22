// KanbanTask.tsx
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export type Task = {
	id: string;
	title: string;
	order: number;
	columnId: string;
};

interface KanbanTaskProps {
	task: Task;
	columnId: string;
}

const KanbanTask: React.FC<KanbanTaskProps> = ({ task, columnId }) => {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({
			id: task.id,
			data: { type: 'task', columnId },
		});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		cursor: 'grab',
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="mb-2 p-2 bg-white shadow rounded"
		>
			{task.title}
		</div>
	);
};

export default KanbanTask;
