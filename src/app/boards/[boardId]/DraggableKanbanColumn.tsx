// DraggableKanbanColumn.tsx
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import KanbanColumn, { Column } from './KanbanColumn';

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
			data: { type: 'column', columnId: column.id },
		});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			<KanbanColumn column={column} onAddTask={onAddTask} />
		</div>
	);
};

export default DraggableKanbanColumn;
