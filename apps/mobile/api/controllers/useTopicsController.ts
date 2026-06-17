import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { REACT_QUERY_KEYS, ReactQueryOptions } from "@/api/endpoints/KEYS";
import { invalidateNotesListQueries } from "@/api/utils/invalidateNotesAndThoughtsQueries";
import {
  deleteTopicById,
  getAllTopics,
  getAllTopicsWithAssociatedNotesAndThoughts,
  getAllTopicsWithNotesInfos,
  insertNewTopic,
  updateTopicById,
} from "../endpoints/topics";
import { Topic } from "@repo/zod-schemas";
import { useGraphController } from "./useGraphController";

export const useTopicsController = () => {
  const useFetchAllTopicsQuery = (options?: ReactQueryOptions) =>
    useQuery<Awaited<ReturnType<typeof getAllTopics>>>({
      queryKey: [REACT_QUERY_KEYS.fetchAllTopics],
      queryFn: getAllTopics,
      ...options,
    });

  const useInsertNewTopicMutation = () =>
    useMutation<
      Awaited<ReturnType<typeof insertNewTopic>>,
      Error,
      { data: Topic }
    >({
      mutationKey: [REACT_QUERY_KEYS.insertNewTopic],
      mutationFn: ({ data }) => insertNewTopic(data),
    });

  const useFetchAllTopicsWithNotesInfosQuery = (options?: ReactQueryOptions) =>
    useQuery<Awaited<ReturnType<typeof getAllTopicsWithNotesInfos>>>({
      queryKey: [REACT_QUERY_KEYS.fetchAllTopicsWithNotesInfos],
      queryFn: getAllTopicsWithNotesInfos,
      staleTime: 60_000,
      placeholderData: keepPreviousData,
      ...options,
    });

  const useDeleteTopicByIdMutation = () => {
    const queryClient = useQueryClient();
    const { useUpdateSyncGraphDataMutation } = useGraphController();
    const { mutateAsync: mutateAsyncGraphData } =
      useUpdateSyncGraphDataMutation();
    return useMutation<
      Awaited<ReturnType<typeof deleteTopicById>>,
      Error,
      { id: string }
    >({
      mutationKey: [REACT_QUERY_KEYS.deleteTopicById],
      mutationFn: ({ id }) => deleteTopicById(id),
      onSuccess: async () => {
        try {
          await mutateAsyncGraphData(true);
        } finally {
          await invalidateNotesListQueries(queryClient);
          await queryClient.invalidateQueries({
            queryKey: [REACT_QUERY_KEYS.fetchAllThoughtsWithEmbeddings],
            refetchType: "all",
          });
          await queryClient.invalidateQueries({
            queryKey: [REACT_QUERY_KEYS.fetchThoughts],
            refetchType: "all",
          });
          await queryClient.invalidateQueries({
            queryKey: [REACT_QUERY_KEYS.fetchGraphData],
            refetchType: "all",
          });
          await queryClient.invalidateQueries({
            queryKey: [REACT_QUERY_KEYS.seedDatabase],
            refetchType: "all",
          });
        }
      },
    });
  };

  const useFetchAllTopicsWithAssociatedNotesAndThoughtsQuery = (
    options?: ReactQueryOptions
  ) =>
    useQuery<
      Awaited<ReturnType<typeof getAllTopicsWithAssociatedNotesAndThoughts>>
    >({
      queryKey: [REACT_QUERY_KEYS.fetchAllTopicsWithAssociatedNotesAndThoughts],
      queryFn: getAllTopicsWithAssociatedNotesAndThoughts,
      refetchOnMount: "always",
      structuralSharing: false,
      ...options,
    });

  const useUpdateTopicByIdMutation = () => {
    const queryClient = useQueryClient();
    const { useUpdateSyncGraphDataMutation } = useGraphController();
    const { mutateAsync: mutateAsyncGraphData } =
      useUpdateSyncGraphDataMutation();
    return useMutation<
      Awaited<ReturnType<typeof updateTopicById>>,
      Error,
      { id: string; name: string; embedding: Float32Array }
    >({
      mutationKey: [REACT_QUERY_KEYS.updateTopicById],
      mutationFn: (data) => updateTopicById(data),
      onSuccess: async () => {
        await mutateAsyncGraphData(true);
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchAllTopicsWithNotesInfos],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchAllTopics],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchGraphData],
        });
      },
    });
  };

  return {
    useFetchAllTopicsQuery,
    useInsertNewTopicMutation,
    useFetchAllTopicsWithNotesInfosQuery,
    useDeleteTopicByIdMutation,
    useUpdateTopicByIdMutation,
    useFetchAllTopicsWithAssociatedNotesAndThoughtsQuery,
  };
};
