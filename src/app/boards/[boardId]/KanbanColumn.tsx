'use client';

import React from 'react';
import {
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import KanbanTask, { Task } from './KanbanTask';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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
	const sortedTasks = [...column.tasks].sort((a, b) => a.order - b.order);
	const taskIds = sortedTasks.map((task) => task.id);

	return (
		<div className="flex flex-col space-y-2">
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

			{/* "Add Task" button - transparent until hover, plus icon */}
			<Button
				variant="ghost"
				className="justify-start px-1 text-gray-500 hover:bg-gray-200"
				onClick={() => onAddTask(column.id)}
			>
				<Plus className="mr-1 w-4 h-4" />
				Add Task
			</Button>
		</div>
	);
};

export default KanbanColumn;
