export type TeamMember = {
	id: string;
	user: {
		id: string;
		email: string;
		name?: string;
	};
	teamRole: {
		id: string;
		name: string;
	};
};

export type Task = {
	id: string;
	title: string;
	order: number;
	columnId: string;
};

export type Column = {
	id: string;
	title: string;
	order: number;
	tasks: Task[];
};
