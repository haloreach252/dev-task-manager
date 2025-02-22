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
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: task.id,
		data: { type: 'task', columnId, ...task },
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		cursor: 'grab',
		opacity: isDragging ? 0 : 1, // Hide original when dragging
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
