// src/app/boards/[boardId]/KanbanColumn.tsx

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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export type Column = PColumn & {
	tasks: Task[];
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
		<Card className="w-full">
			<CardHeader className="pb-0">
				<CardTitle className="text-lg font-semibold">
					{column.title}
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col space-y-4">
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
					className="justify-start px-1 text-gray-500 hover:bg-gray-200"
					onClick={() => onAddTask(column.id)}
				>
					<Plus className="mr-1 w-4 h-4" />
					Add Task
				</Button>
			</CardContent>
		</Card>
	);
};

export default KanbanColumn;
