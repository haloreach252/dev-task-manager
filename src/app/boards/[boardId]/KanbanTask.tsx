'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type Task = {
	id: string;
	title: string;
	order: number;
	columnId: string;
};

interface KanbanTaskProps {
	task: Task;
	columnId: string;
}

const KanbanTask: React.FC<KanbanTaskProps> = ({ task, columnId }) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: task.id,
		data: { type: 'task', columnId, ...task },
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		cursor: 'grab',
		opacity: isDragging ? 0 : 1,
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			<Card className="mb-2">
				<CardHeader>
					<CardTitle className="text-sm font-medium">
						{task.title}
					</CardTitle>
				</CardHeader>
				<CardContent className="text-xs text-muted-foreground">
					{/* Additional details can go here */}
				</CardContent>
			</Card>
		</div>
	);
};

export default KanbanTask;
