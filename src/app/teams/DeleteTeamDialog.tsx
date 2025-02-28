import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function DeleteTeamDialog({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Team?</DialogTitle>
				</DialogHeader>
				<p>Are you sure you want to delete this team? This action is irreversible.</p>
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>Cancel</Button>
					<Button variant="destructive" onClick={onConfirm}>Delete</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
