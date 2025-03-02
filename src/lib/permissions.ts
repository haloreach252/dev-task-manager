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
