// KanbanColumn.tsx
'use client';

import React from 'react';
import {
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import KanbanTask from './KanbanTask';
import { Task } from './KanbanTask';

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
	// Sort tasks based on order (ascending).
	const sortedTasks = [...column.tasks].sort((a, b) => a.order - b.order);
	const taskIds = sortedTasks.map((task) => task.id);

	return (
		<>
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
			<Button onClick={() => onAddTask(column.id)}>Add Task</Button>
		</>
	);
};

export default KanbanColumn;
