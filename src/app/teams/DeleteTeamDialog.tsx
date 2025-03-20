import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

type Team = {
	id: string;
	name: string;
};

type DeleteTeamDialogProps = {
	team: Team | null;
	onClose: () => void;
	onConfirm: (teamId: string) => void;
	isDeleting: boolean;
};

export default function DeleteTeamDialog({
	team,
	onClose,
	onConfirm,
	isDeleting,
}: DeleteTeamDialogProps) {
	return (
		<Dialog open={!!team} onOpenChange={() => onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Team</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete the team &ldquo;
						{team?.name}&rdquo;? This action cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={onClose}
						disabled={isDeleting}
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={() => team && onConfirm(team.id)}
						disabled={isDeleting}
					>
						{isDeleting ? (
							<>
								<Loader className="w-4 h-4 mr-2 animate-spin" />
								Deleting...
							</>
						) : (
							'Delete Team'
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
