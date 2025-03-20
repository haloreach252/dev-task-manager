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
	const mergedPermissions = deepMerge(rolePermissions, customPermissions);
	return mergedPermissions;
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

function deepMerge(
	rolePerms: Record<string, boolean>,
	customPerms: Record<string, boolean>
): Record<string, boolean> {
	return { ...rolePerms, ...customPerms };
}

export async function checkPermissions(
	userId: string,
	teamId: string,
	permissionsToCheck: string[]
): Promise<boolean> {
	const userPermissions = await getUserPermissions(userId, teamId);

	let hasAllPermissions = true;
	for (const permission of permissionsToCheck) {
		if (!userPermissions[permission]) {
			hasAllPermissions = false;
			break;
		}
	}

	if (userPermissions['*']) {
		hasAllPermissions = true;
	}

	return hasAllPermissions;
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

const managementPermissions: Permission[] = [
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
	{
		key: 'viewSecurityLogs',
		label: 'View Security Logs',
		level: 3,
		category: 'Management',
	},
	{
		key: 'clearSecurityLogs',
		label: 'Clear Security Logs',
		level: 4,
		category: 'Management',
	},
	{
		key: 'viewAuditLogs',
		label: 'View Audit Logs',
		level: 3,
		category: 'Management',
	},
	{
		key: 'exportData',
		label: 'Export Team Data',
		level: 4,
		category: 'Management',
	},
];

const teamPermissions: Permission[] = [
	{ key: 'editTeam', label: 'Edit Team Info', level: 3, category: 'Team' },
	{ key: 'deleteTeam', label: 'Delete Team', level: 4, category: 'Team' },
	{
		key: 'inviteMembers',
		label: 'Invite Members',
		level: 2,
		category: 'Team',
	},
	{
		key: 'removeMembers',
		label: 'Remove Members',
		level: 3,
		category: 'Team',
	},
	{
		key: 'changeMemberRoles',
		label: 'Change Member Roles',
		level: 3,
		category: 'Team',
	},
	{
		key: 'editTeamDescription',
		label: 'Edit Team Description',
		level: 3,
		category: 'Team',
	},
	{ key: 'viewMembers', label: 'View Members', level: 2, category: 'Team' },
];

const taskPermissions: Permission[] = [
	{ key: 'createTasks', label: 'Create Tasks', level: 1, category: 'Task' },
	{ key: 'editTasks', label: 'Edit Tasks', level: 1, category: 'Task' },
	{ key: 'archiveTasks', label: 'Archive Tasks', level: 2, category: 'Task' },
	{ key: 'deleteTasks', label: 'Delete Tasks', level: 3, category: 'Task' },
	{
		key: 'assignTasks',
		label: 'Assign Task Members',
		level: 1,
		category: 'Task',
	},
	{
		key: 'markTasksComplete',
		label: 'Mark Tasks Complete',
		level: 1,
		category: 'Task',
	},
	{
		key: 'commentOnTasks',
		label: 'Comment On Tasks',
		level: 1,
		category: 'Task',
	},
	{
		key: 'deleteComments',
		label: 'Delete Comments',
		level: 2,
		category: 'Task',
	},
	{
		key: 'managePriorities',
		label: 'Manage Task Priority',
		level: 2,
		category: 'Task',
	},
	{ key: 'uploadFiles', label: 'Upload Files', level: 2, category: 'Task' },
	{ key: 'deleteFiles', label: 'Delete Files', level: 3, category: 'Task' },
	{ key: 'viewFiles', label: 'View Files', level: 1, category: 'Task' },
];

const columnPermissions: Permission[] = [
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

const projectPermissions: Permission[] = [
	{
		key: 'createProjects',
		label: 'Create Projects',
		level: 3,
		category: 'Project',
	},
	{
		key: 'editProjects',
		label: 'Edit Project Details',
		level: 2,
		category: 'Project',
	},
	{
		key: 'deleteProjects',
		label: 'Delete Projects',
		level: 3,
		category: 'Project',
	},
	{
		key: 'archiveProjects',
		label: 'Archive Projects',
		level: 2,
		category: 'Project',
	},
	{
		key: 'viewProjects',
		label: 'View Projects',
		level: 1,
		category: 'Project',
	},
];

const boardPermissions: Permission[] = [
	{
		key: 'createBoards',
		label: 'Create Boards',
		level: 3,
		category: 'Board',
	},
	{
		key: 'editBoards',
		label: 'Edit Board Details',
		level: 2,
		category: 'Board',
	},
	{
		key: 'deleteBoards',
		label: 'Delete Boards',
		level: 3,
		category: 'Board',
	},
	{
		key: 'archiveBoards',
		label: 'Archive Boards',
		level: 2,
		category: 'Board',
	},
	{
		key: 'manageBoardVisibility',
		label: 'Manage Board Visibility',
		level: 2,
		category: 'Board',
	},
	{
		key: 'createLabels',
		label: 'Create Board Labels',
		level: 1,
		category: 'Board',
	},
	{
		key: 'editLabels',
		label: 'Edit Board Labels',
		level: 1,
		category: 'Board',
	},
	{
		key: 'deleteLabels',
		label: 'Delete Board Labels',
		level: 2,
		category: 'Board',
	},
	{
		key: 'viewBoards',
		label: 'View Boards',
		level: 1,
		category: 'Board',
	},
];

//{ key: '', label: '', level: 1, category: ''},

export const availablePermissions: Permission[] = [
	...managementPermissions,
	...teamPermissions,
	...taskPermissions,
	...columnPermissions,
	...projectPermissions,
	...boardPermissions,
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

export const defaultAdminPermissions = {
	'*': true,
};

export const defaultEditorPermissions = {};

export const defaultViewerPermissions = {};
