import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchGraphData,
  fetchSyncGraph,
  updateGraphData,
  updateSyncGraphData,
} from "@/api/endpoints/graph";
import {
  InferMutationOptions,
  REACT_QUERY_KEYS,
  ReactQueryOptions,
} from "@/api/endpoints/KEYS";

export const useGraphController = () => {
  const useFetchGraphDataQuery = (options?: ReactQueryOptions) =>
    useQuery<Awaited<ReturnType<typeof fetchGraphData>>>({
      queryKey: [REACT_QUERY_KEYS.fetchGraphData],
      queryFn: fetchGraphData,
      ...options,
    });

  const useFetchSyncGraphQuery = (options?: ReactQueryOptions) =>
    useQuery<Awaited<ReturnType<typeof fetchSyncGraph>>>({
      queryKey: [REACT_QUERY_KEYS.fetchSyncGraph],
      queryFn: fetchSyncGraph,
      ...options,
    });

  const useUpdateGraphDataMutation = (
    options?: Partial<InferMutationOptions<typeof updateGraphData>>
  ) => {
    const queryClient = useQueryClient();
    const { mutateAsync: mutateSyncGraph } = useUpdateSyncGraphDataMutation();

    return useMutation({
      mutationKey: [REACT_QUERY_KEYS.updateGraphData],
      mutationFn: updateGraphData,
      onSuccess: async () => {
        await mutateSyncGraph(false);

        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchSyncGraph],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchGraphData],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.seedDatabase],
        });
      },
      ...options,
    });
  };

  const useUpdateSyncGraphDataMutation = (
    options?: Partial<InferMutationOptions<typeof updateSyncGraphData>>
  ) => {
    const queryClient = useQueryClient();
    const { onSuccess: userOnSuccess, ...restOptions } = options ?? {};
    return useMutation({
      mutationKey: [REACT_QUERY_KEYS.updateSyncGraphData],
      mutationFn: updateSyncGraphData,
      ...restOptions,
      onSuccess: async (data, variables, onMutateResult, context) => {
        await userOnSuccess?.(data, variables, onMutateResult, context);
        await queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchSyncGraph],
        });
      },
    });
  };

  // const useUpdateGraphDataMutation = useMutation({
  //   mutationKey: [REACT_QUERY_KEYS.updateGraphData],
  //   mutationFn: updateGraphData,
  // });

  return {
    useFetchGraphDataQuery,
    useFetchSyncGraphQuery,
    useUpdateGraphDataMutation,
    useUpdateSyncGraphDataMutation,
  };
};
