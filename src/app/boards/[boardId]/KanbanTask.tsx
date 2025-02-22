// src/app/boards/[boardId]/KanbanTask.tsx

/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type TaskDetails as Task } from './TaskDetailsDialog';

interface KanbanTaskProps {
	task: Task;
	columnId: string;
	onOpenDetails: (task: Task) => void;
}

const KanbanTask: React.FC<KanbanTaskProps> = ({
	task,
	columnId,
	onOpenDetails,
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: task.id,
		data: { type: 'task', ...task } as const,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		cursor: 'grab',
		opacity: isDragging ? 0 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			onClick={() => {
				if (!isDragging) onOpenDetails(task);
			}}
		>
			<Card className="shadow-sm">
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">
						{task.title}
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-0 text-xs text-muted-foreground">
					{/* Additional details (description, labels, cover, etc.) can go here. */}
				</CardContent>
			</Card>
		</div>
	);
};

export default KanbanTask;
