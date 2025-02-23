'use client';

import React from 'react';
import {
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import KanbanTask from './KanbanTask';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { type Column as PColumn } from '@prisma/client';
import { type TaskDetails as Task } from './TaskDetailsDialog';

export type Column = PColumn & {
	tasks: Task[];
	title: string;
	backgroundColor?: string;
};

interface KanbanColumnProps {
	column: Column;
	onAddTask: (columnId: string) => void;
	onOpenTask: (task: Task) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
	column,
	onAddTask,
	onOpenTask,
}) => {
	const sortedTasks = [...column.tasks].sort((a, b) => a.order - b.order);
	const taskIds = sortedTasks.map((task) => task.id);

	return (
		<div className="flex flex-col space-y-4">
			<SortableContext
				items={taskIds}
				strategy={verticalListSortingStrategy}
			>
				{sortedTasks.map((task) => (
					<KanbanTask
						key={task.id}
						task={task}
						columnId={column.id}
						onOpenDetails={onOpenTask}
					/>
				))}
			</SortableContext>

			<Button
				variant="ghost"
				className="justify-start"
				onClick={() => onAddTask(column.id)}
			>
				<Plus className="mr-1 w-4 h-4" />
				Add Task
			</Button>
		</div>
	);
};

export default KanbanColumn;
