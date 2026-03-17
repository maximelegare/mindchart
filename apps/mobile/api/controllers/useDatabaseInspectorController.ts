import {
  InferMutationOptions,
  REACT_QUERY_KEYS,
  ReactQueryOptions,
} from "../endpoints/KEYS";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchMigratingStatus,
  updateMigratingStatus,
} from "../endpoints/databaseInspector";

export const useDatabaseInspectorController = () => {
  const useFetchMigratingStatus = (options?: ReactQueryOptions) =>
    useQuery<Awaited<ReturnType<typeof fetchMigratingStatus>>>({
      queryKey: [REACT_QUERY_KEYS.fetchGraphData],
      queryFn: fetchMigratingStatus,
      ...options,
    });

  const useUpdateSyncGraphDataMutation = (
    options?: Partial<InferMutationOptions<typeof updateMigratingStatus>>
  ) => {
    return useMutation({
      mutationKey: [REACT_QUERY_KEYS.updateMigratingStatus],
      mutationFn: updateMigratingStatus,
      ...options,
    });
  };

  return {
    useFetchMigratingStatus,
    useUpdateSyncGraphDataMutation,
  };
};
