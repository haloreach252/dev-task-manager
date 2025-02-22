// src/app/boards/[boardId]/DraggableKanbanColumn.tsx

'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import KanbanColumn, { Column } from './KanbanColumn';
import { type TaskDetails as Task } from './TaskDetailsDialog';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

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

	// Local state for the column background color (hex string)
	const [bgColor, setBgColor] = useState(column.backgroundColor ?? '#ffffff');

	return (
		<Card
			ref={setNodeRef}
			style={{ ...style, backgroundColor: bgColor }}
			className="w-80 rounded shadow"
		>
			<CardHeader className="flex items-center justify-between border-b border-gray-300 pb-2">
				<div className="cursor-grab" {...attributes} {...listeners}>
					<h2 className="text-xl font-bold">{column.title}</h2>
				</div>
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="ghost" className="p-1">
							<Palette className="w-4 h-4" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="p-2 space-y-2">
						<HexColorPicker
							color={bgColor}
							onChange={setBgColor}
							className="rounded-md"
						/>
						<div className="text-sm text-gray-500">
							Selected color:{' '}
							<span className="font-medium">{bgColor}</span>
						</div>
					</PopoverContent>
				</Popover>
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
