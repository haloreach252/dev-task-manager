'use client';

import React, { useState } from 'react';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Palette, Archive } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { useUpdateColumnColor } from '@/hooks/useUpdateColumnColor';

interface ColumnActionsPopoverProps {
	columnId: string;
	boardId: string;
	bgColor: string;
	setBgColor: (color: string) => void;
	onArchive?: () => void;
	setIsPaletteOpen: (isOpen: boolean) => void;
}

const ColumnActionsPopover: React.FC<ColumnActionsPopoverProps> = ({
	columnId,
	boardId,
	bgColor,
	setBgColor,
	onArchive,
	setIsPaletteOpen
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		setIsPaletteOpen(open);
	}

	const updateColorMutation = useUpdateColumnColor();

	const handleColorChange = (newColor: string) => {
		// Optimistically update local state
		setBgColor(newColor);

		// Trigger the mutation with optimistic update
		updateColorMutation.mutate({
			columnId,
			boardId,
			backgroundColor: newColor,
		});
	};

	return (
		<Popover open={isOpen} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<Button variant="ghost" className="p-1">
					<Palette className="w-4 h-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="p-2 space-y-4">
				{/* Color Picker Section */}
				<div>
					<HexColorPicker
						color={bgColor}
						onChange={handleColorChange}
						className="rounded-md"
					/>
					<div className="mt-1 text-sm text-gray-500">
						Selected color:{' '}
						<span className="font-medium">{bgColor}</span>
					</div>
				</div>
				{/* Additional Action */}
				{onArchive && (
					<Button
						variant="outline"
						size="sm"
						className="w-full"
						onClick={onArchive}
					>
						<Archive className="mr-1 w-4 h-4" />
						Archive Column
					</Button>
				)}
			</PopoverContent>
		</Popover>
	);
};

export default ColumnActionsPopover;
