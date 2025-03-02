import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchPermissions = async (teamIdOrIds: string | string[]) => {
	const payload = Array.isArray(teamIdOrIds)
		? { teamIds: teamIdOrIds }
		: { teamId: teamIdOrIds };
	const { data } = await axios.post(`/api/permissions`, payload);
	return data.permissions || {};
};

export function usePermissions(teamIdOrIds: string | string[]) {
	const {
		data: permissions,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['permissions', ...teamIdOrIds],
		queryFn: () => fetchPermissions(teamIdOrIds),
		enabled: !!teamIdOrIds,
		staleTime: 60000, // Cache for 1 minute
	});

	const hasPermission = (teamId: string, perm: string) =>
		permissions?.[teamId]?.[perm] === true ||
		permissions?.[teamId]?.['*'] === true;

	return { permissions, hasPermission, isLoading, error };
}
