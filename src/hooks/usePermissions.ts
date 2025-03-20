import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchPermissions = async (teamIdOrIds: string | string[]) => {
	const payload = Array.isArray(teamIdOrIds)
		? { teamIds: teamIdOrIds }
		: { teamId: teamIdOrIds };
	const { data } = await axios.post(`/api/permissions`, payload);
	if (!data.success) {
		throw new Error(data.error?.message || 'Failed to fetch permissions');
	}
	return data.data.permissions || {};
};

export function usePermissions(teamIdOrIds: string | string[]) {
	const {
		data: permissions,
		isLoading,
		error,
	} = useQuery({
		queryKey: [
			'permissions',
			...(Array.isArray(teamIdOrIds) ? teamIdOrIds : [teamIdOrIds]),
		],
		queryFn: () => fetchPermissions(teamIdOrIds),
		enabled: !!teamIdOrIds && teamIdOrIds.length > 0,
		staleTime: 60000, // Cache for 1 minute
	});

	const hasPermission = (teamId: string, perm: string) => {
		const hasPermResult =
			permissions?.[teamId]?.[perm] === true ||
			permissions?.[teamId]?.['*'] === true;
		return hasPermResult;
	};

	return { permissions, hasPermission, isLoading, error };
}
