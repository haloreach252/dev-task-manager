import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, ListChecks, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type ProjectCardProps = {
	project: {
		id: string;
		name: string;
		description: string;
		team: { name: string };
		updatedAt: string;
		totalBoards: number;
		totalTasks: number;
		status?: 'active' | 'archived' | 'completed';
	};
	onClick: () => void;
};

export function ProjectCard({ project, onClick }: ProjectCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.3 }}
		>
			<Card
				className="group hover:shadow-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]"
				onClick={onClick}
			>
				<CardHeader className="pb-2">
					<div className="flex items-start justify-between">
						<h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
							{project.name}
						</h3>
						{project.status && (
							<Badge
								variant={
									project.status === 'active'
										? 'default'
										: project.status === 'completed'
										? 'secondary'
										: 'outline'
								}
							>
								{project.status.charAt(0).toUpperCase() +
									project.status.slice(1)}
							</Badge>
						)}
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm text-muted-foreground line-clamp-2">
						{project.description || 'No description provided'}
					</p>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Users className="w-4 h-4" />
						<span>{project.team.name}</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<div className="flex items-center gap-2 text-muted-foreground">
							<LayoutGrid className="w-4 h-4" />
							<span>
								{project.totalBoards}{' '}
								{project.totalBoards === 1 ? 'Board' : 'Boards'}
							</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<ListChecks className="w-4 h-4" />
							<span>
								{project.totalTasks}{' '}
								{project.totalTasks === 1 ? 'Task' : 'Tasks'}
							</span>
						</div>
					</div>
					<div className="text-xs text-muted-foreground">
						Updated{' '}
						{formatDistanceToNow(new Date(project.updatedAt))} ago
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
