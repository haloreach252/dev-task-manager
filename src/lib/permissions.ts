import prisma from './prisma';

export async function getUserPermissions(userId: string, teamId: string) {
	const teamMember = await prisma.teamMember.findUnique({
		where: { userId_teamId: { userId, teamId } },
		include: { teamRole: true },
	});

	if (!teamMember) return {};

	// Parse stored permissions
	const rolePermissions = JSON.parse(teamMember.teamRole.permissions || '{}');
	const customPermissions = JSON.parse(teamMember.customPermissions || '{}');

	// Merge role and custom permissions (custom overrides role)
	return deepMerge(rolePermissions, customPermissions);
}

export function getUserMaxPermissionLevel(
	userPermissions: Record<string, boolean>
): number {
	if (userPermissions['*']) return 5;
	return Math.max(
		...Object.keys(userPermissions).map(
			(perm) => permissionLevels[perm] || 0
		),
		0
	);
}

export async function logUnauthorizedAccess(
	userId: string,
	teamId: string,
	action: string
) {
	await prisma.securityLogs.create({
		data: {
			userId,
			teamId,
			actionAttempted: action,
			timestamp: new Date(),
		},
	});
}

function deepMerge(rolePerms: any, customPerms: any) {
	return { ...rolePerms, ...customPerms };
}

/*
 * Permission settings:
 * This area will contain all the permissions in the app, as well as helper
 * functions to provide easy functionality of the permission system
 */
export type Permission = {
	key: string;
	label: string;
	level: number;
	category: 'Management' | 'Team' | 'Task' | 'Column' | 'Board' | 'Project';
};

export const availablePermissions: Permission[] = [
	// General management
	{
		key: '*',
		label: 'All Permissions (Admin)',
		level: 5,
		category: 'Management',
	},
	{
		key: 'manageMembers',
		label: 'Manage Members',
		level: 3,
		category: 'Management',
	},
	{
		key: 'manageRoles',
		label: 'Manage Roles',
		level: 4,
		category: 'Management',
	},

	// Team management
	{ key: 'editTeam', label: 'Edit Team Info', level: 3, category: 'Team' },
	{ key: 'deleteTeam', label: 'Delete Team', level: 4, category: 'Team' },

	// Task Management
	{ key: 'createTasks', label: 'Create Tasks', level: 1, category: 'Task' },
	{ key: 'editTasks', label: 'Edit Tasks', level: 1, category: 'Task' },
	{ key: 'archiveTasks', label: 'Archive Tasks', level: 2, category: 'Task' },
	{ key: 'deleteTasks', label: 'Delete Tasks', level: 3, category: 'Task' },

	// Column Management
	{
		key: 'createColumns',
		label: 'Create Columns',
		level: 1,
		category: 'Column',
	},
	{ key: 'editColumns', label: 'Edit Columns', level: 1, category: 'Column' },
	{
		key: 'archiveColumns',
		label: 'Archive Columns',
		level: 2,
		category: 'Column',
	},
	{
		key: 'deleteColumns',
		label: 'Delete Columns',
		level: 3,
		category: 'Column',
	},
];

// Generate an object for quick lookups
export const permissionLabels: Record<string, string> = Object.fromEntries(
	availablePermissions.map((perm) => [perm.key, perm.label])
);

export const permissionLevels: Record<string, number> = Object.fromEntries(
	availablePermissions.map((perm) => [perm.key, perm.level])
);

export const permissionCategories: Record<string, string> = Object.fromEntries(
	availablePermissions.map((perm) => [perm.key, perm.category])
);
