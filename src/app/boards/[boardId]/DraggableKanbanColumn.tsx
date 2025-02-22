'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import KanbanColumn, { Column } from './KanbanColumn';
import { type TaskDetails as Task } from './TaskDetailsDialog';

interface DraggableKanbanColumnProps {
	column: Column;
	onAddTask: (columnId: string) => void;
	onOpenTask: (task: Task) => void;
}

const DraggableKanbanColumn: React.FC<DraggableKanbanColumnProps> = ({
	column,
	onAddTask,
	onOpenTask,
}) => {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({
			id: column.id,
			data: { type: 'column', columnId: column.id, ...column },
		});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="w-80 bg-gray-50 rounded shadow p-4 flex flex-col"
		>
			{/* Column Header: Draggable handle */}
			<div
				className="cursor-grab pb-2 mb-2 border-b border-gray-300"
				{...attributes}
				{...listeners}
			>
				<h2 className="text-xl font-bold">{column.title}</h2>
			</div>

			{/* Tasks + "Add Task" button */}
			<KanbanColumn
				column={column}
				onAddTask={onAddTask}
				onOpenTask={onOpenTask}
			/>
		</div>
	);
};

export default DraggableKanbanColumn;
