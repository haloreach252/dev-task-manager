import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface UpdateColumnColorData {
	boardId: string;
	columnId: string;
	backgroundColor: string;
}

export function useUpdateColumnColor() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			boardId,
			columnId,
			backgroundColor,
		}: UpdateColumnColorData) => {
			const response = await axios.put(
				`/api/boards/${boardId}/columns/${columnId}`,
				{ backgroundColor }
			);
			return response.data;
		},
		onMutate: async ({
			columnId,
			backgroundColor,
			boardId,
		}: UpdateColumnColorData) => {
			// Cancel any outgoing refetches for this column
			await queryClient.cancelQueries({
				queryKey: ['column', boardId, columnId],
			});

			// Snapshot the previous value
			const previousColumn = queryClient.getQueryData<any>([
				'column',
				boardId,
				columnId,
			]);

			// Optimistically update the column color in the cache
			queryClient.setQueryData(
				['column', boardId, columnId],
				(old: any) => {
					if (!old) return;
					return { ...old, backgroundColor };
				}
			);

			// Return the previous column for rollback in case of error
			return { previousColumn };
		},
		onError: (error, variables, context: any) => {
			// Roll back to the previous column data on error
			queryClient.setQueryData(
				['column', variables.boardId, variables.columnId],
				context.previousColumn
			);
		},
		onSettled: (data, error, variables) => {
			// Always refetch after error or success
			queryClient.invalidateQueries({
				queryKey: ['column', variables.boardId, variables.columnId],
			});
		},
	});
}
