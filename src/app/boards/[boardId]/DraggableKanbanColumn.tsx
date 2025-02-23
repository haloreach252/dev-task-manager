// src/app/boards/[boardId]/DraggableKanbanColumn.tsx

'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import KanbanColumn, { Column } from './KanbanColumn';
import { type TaskDetails as Task } from './TaskDetailsDialog';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import ColumnActionsPopover from './ColumnActionsPopover';

interface DraggableKanbanColumnProps {
	column: Column;
	onAddTask: (columnId: string) => void;
	onOpenTask: (task: Task) => void;
	onArchiveColumn?: (columnId: string) => void;
}

const DraggableKanbanColumn: React.FC<DraggableKanbanColumnProps> = ({
	column,
	onAddTask,
	onOpenTask,
	onArchiveColumn,
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

	// Local state for the column background color (hex string)
	const [bgColor, setBgColor] = useState(column.backgroundColor ?? '#ffffff');

	const handleArchive = () => {
		if (onArchiveColumn) onArchiveColumn(column.id);
	};

	return (
		<Card
			ref={setNodeRef}
			style={{ ...style, backgroundColor: bgColor }}
			className="w-80 rounded shadow"
		>
			<CardHeader className="flex items-center justify-between border-b border-gray-300 pb-2">
				<div
					className="flex flex-row gap-4 cursor-grab"
					{...attributes}
					{...listeners}
				>
					<h2 className="text-xl font-bold">{column.title}</h2>
					<ColumnActionsPopover
						columnId={column.id}
						boardId={column.boardId}
						bgColor={bgColor}
						setBgColor={setBgColor}
						onArchive={handleArchive}
					/>
				</div>
			</CardHeader>
			<CardContent className="p-4">
				{/* Tasks + "Add Task" button */}
				<KanbanColumn
					column={column}
					onAddTask={onAddTask}
					onOpenTask={onOpenTask}
				/>
			</CardContent>
		</Card>
	);
};

export default DraggableKanbanColumn;
