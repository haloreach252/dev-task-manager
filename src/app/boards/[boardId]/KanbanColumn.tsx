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
	// Sort tasks in ascending order
	const sortedTasks = [...column.tasks].sort((a, b) => a.order - b.order);
	const taskIds = sortedTasks.map((task) => task.id);

	return (
		<div className="space-y-4">
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
			<Button variant="outline" onClick={() => onAddTask(column.id)}>
				Add Task
			</Button>
		</div>
	);
};

export default KanbanColumn;
