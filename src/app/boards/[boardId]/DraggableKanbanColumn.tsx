// src/app/boards/[boardId]/DraggableKanbanColumn.tsx

'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import KanbanColumn, { Column } from './KanbanColumn';
import { type TaskDetails as Task } from './TaskDetailsDialog';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import ColumnActionsPopover from './ColumnActionsPopover';

const getContrastColor = (hexColor: string) => {
	// Remove the hash if present
	const color = hexColor.replace('#', '');
	const r = parseInt(color.substring(0, 2), 16);
	const g = parseInt(color.substring(2, 4), 16);
	const b = parseInt(color.substring(4, 6), 16);

	// YIQ formula to determine brightness
	const yiq = (r * 299 + g * 587 + b * 114) / 1000;

	// If brightness is less than 128, return white; else, black
	return yiq >= 128 ? '#000000' : '#FFFFFF';
};

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
	const [isPaletteOpen, setIsPaletteOpen] = useState(false);

	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({
			id: column.id,
			data: { type: 'column', columnId: column.id, ...column },
			disabled: isPaletteOpen
		});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	// Local state for the column background color (hex string)
	const [bgColor, setBgColor] = useState(column.backgroundColor ?? '#ffffff');

	// Dynamically set title color based on bgColor
	const titleColor = getContrastColor(bgColor);

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
					style={{ cursor: isPaletteOpen ? 'default' : 'grab' }}
				>
					<h2 className="text-xl font-bold" style={{ color: titleColor }}>{column.title}</h2>
					<ColumnActionsPopover
						columnId={column.id}
						boardId={column.boardId}
						bgColor={bgColor}
						setBgColor={setBgColor}
						onArchive={handleArchive}
						setIsPaletteOpen={setIsPaletteOpen}
					/>
				</div>
			</CardHeader>
			<CardContent className="p-4">
				{/* Tasks + "Add Task" button */}
				<KanbanColumn
					column={column}
					onAddTask={onAddTask}
					onOpenTask={onOpenTask}
					titleColor={titleColor}
				/>
			</CardContent>
		</Card>
	);
};

export default DraggableKanbanColumn;
