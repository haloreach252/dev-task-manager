// DraggableKanbanColumn.tsx
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import KanbanColumn from './KanbanColumn';
import { Column } from './KanbanColumn';

interface DraggableKanbanColumnProps {
	column: Column;
	onAddTask: (columnId: string) => void;
}

const DraggableKanbanColumn: React.FC<DraggableKanbanColumnProps> = ({
	column,
	onAddTask,
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
			className="w-64 bg-gray-100 rounded p-2"
		>
			{/* Only the header gets the drag listeners */}
			<div className="cursor-grab" {...attributes} {...listeners}>
				<h2 className="font-bold mb-2">{column.title}</h2>
			</div>
			{/* Render the tasks and Add Task button without drag listeners */}
			<KanbanColumn column={column} onAddTask={onAddTask} />
		</div>
	);
};

export default DraggableKanbanColumn;
