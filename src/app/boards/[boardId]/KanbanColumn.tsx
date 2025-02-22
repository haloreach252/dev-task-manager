// KanbanColumn.tsx
'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import KanbanTask, { Task } from './KanbanTask';

export type Column = {
	id: string;
	title: string;
	order: number;
	tasks: Task[];
};

interface KanbanColumnProps {
	column: Column;
	onAddTask: (columnId: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, onAddTask }) => {
	const { setNodeRef } = useDroppable({
		id: `column-${column.id}`,
		data: { type: 'column', columnId: column.id },
	});

	// Sort tasks by order (ascending)
	const sortedTasks = [...column.tasks].sort((a, b) => a.order - b.order);
	const taskIds = sortedTasks.map((task) => task.id);

	return (
		<div className="w-64 bg-gray-100 rounded p-2">
			<h2 className="font-bold mb-2">{column.title}</h2>
			<div ref={setNodeRef}>
				<SortableContext
					items={taskIds}
					strategy={verticalListSortingStrategy}
				>
					{sortedTasks.map((task) => (
						<KanbanTask
							key={task.id}
							task={task}
							columnId={column.id}
						/>
					))}
				</SortableContext>
			</div>
			<Button onClick={() => onAddTask(column.id)}>Add Task</Button>
		</div>
	);
};

export default KanbanColumn;
