import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

type ProjectFiltersProps = {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	statusFilter: string;
	onStatusChange: (value: string) => void;
	teamFilter: string;
	onTeamChange: (value: string) => void;
	teams: { id: string; name: string }[];
};

export function ProjectFilters({
	searchQuery,
	onSearchChange,
	statusFilter,
	onStatusChange,
	teamFilter,
	onTeamChange,
	teams,
}: ProjectFiltersProps) {
	return (
		<div className="flex flex-col sm:flex-row gap-4">
			<div className="relative flex-1">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search projects..."
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					className="pl-9"
				/>
			</div>
			<div className="flex gap-4">
				<Select value={statusFilter} onValueChange={onStatusChange}>
					<SelectTrigger className="w-[180px]">
						<Filter className="h-4 w-4 mr-2" />
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="active">Active</SelectItem>
						<SelectItem value="archived">Archived</SelectItem>
						<SelectItem value="completed">Completed</SelectItem>
					</SelectContent>
				</Select>
				<Select value={teamFilter} onValueChange={onTeamChange}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Team" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Teams</SelectItem>
						{teams.map((team) => (
							<SelectItem key={team.id} value={team.id}>
								{team.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
