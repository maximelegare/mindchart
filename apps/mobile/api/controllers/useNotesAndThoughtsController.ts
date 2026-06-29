import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteNoteById,
  fetchAllNotes,
  insertNoteAndThoughts,
  updateNoteAndThoughts,
} from "@/api/endpoints/notes";
import {
  InferMutationOptions,
  REACT_QUERY_KEYS,
  ReactQueryOptions,
} from "@/api/endpoints/KEYS";
import {
  fetchNoteDetails,
  fetchNotesAndThoughts,
  fetchNotesByTopicWithAssociatedThoughts,
} from "@/api/endpoints/thoughtsAndNotes";
import {
  deleteThoughtsByIds,
  fetchAllThoughtsWithEmbeddings,
} from "@/api/endpoints/thoughts";
import { invalidateNotesAndThoughtsQueries } from "@/api/utils/invalidateNotesAndThoughtsQueries";
import { useGraphController } from "./useGraphController";

import { useGenerateNoteService } from "@/features/notes/noteCreation/features/generateNote/services/generateNoteService";
import { GenerateNoteService } from "@/features/notes/noteCreation/features/generateNote/types";
import { useSeedDatabaseService } from "@/seed/useSeedDatabaseService";

export const useNotesAndThoughtsController = () => {
  const useSeedDatabaseMutation = () => {
    const queryClient = useQueryClient();
    const { seedDatabaseService } = useSeedDatabaseService();
    const { useUpdateSyncGraphDataMutation } = useGraphController();
    const { mutateAsync: mutateAsyncGraphData } =
      useUpdateSyncGraphDataMutation();
    return useMutation<
      Awaited<ReturnType<typeof seedDatabaseService>>,
      Error,
      number
    >({
      mutationKey: [REACT_QUERY_KEYS.seedDatabase],
      mutationFn: (numberOfNotes: number) => seedDatabaseService(numberOfNotes),
      onSuccess: async () => {
        try {
          await mutateAsyncGraphData(true);
        } finally {
          await invalidateNotesAndThoughtsQueries(queryClient);
        }
      },
    });
  };

  const useGenerateNoteMutation = () => {
    const { generateNoteService } = useGenerateNoteService();

    return useMutation<
      Awaited<ReturnType<typeof generateNoteService>>,
      Error,
      GenerateNoteService
    >({
      mutationKey: [REACT_QUERY_KEYS.generateNote],
      mutationFn: generateNoteService,
    });
  };

  const useInsertNoteAndThoughtsMutation = (
    options?: Partial<InferMutationOptions<typeof insertNoteAndThoughts>>
  ) => {
    const queryClient = useQueryClient();
    const { useUpdateSyncGraphDataMutation } = useGraphController();
    const { mutateAsync: mutateAsyncGraphData } =
      useUpdateSyncGraphDataMutation();

    return useMutation({
      mutationKey: [REACT_QUERY_KEYS.insertNoteAndThoughts],
      mutationFn: insertNoteAndThoughts,
      ...options,
      onSuccess: async (...args) => {
        try {
          await mutateAsyncGraphData(true);
        } finally {
          await invalidateNotesAndThoughtsQueries(queryClient);
        }
        await options?.onSuccess?.(...args);
      },
    });
  };

  const useDeleteThoughtsByIdsMutation = (
    options?: Partial<InferMutationOptions<typeof deleteThoughtsByIds>>
  ) => {
    const queryClient = useQueryClient();
    const { useUpdateSyncGraphDataMutation } = useGraphController();
    const { mutateAsync: mutateAsyncGraphData } =
      useUpdateSyncGraphDataMutation();

    return useMutation({
      mutationKey: [REACT_QUERY_KEYS.deleteThoughtsByIds],
      mutationFn: deleteThoughtsByIds,
      ...options,
      onSuccess: async (...args) => {
        try {
          await mutateAsyncGraphData(true);
        } finally {
          await invalidateNotesAndThoughtsQueries(queryClient);
        }
        await options?.onSuccess?.(...args);
      },
    });
  };

  const useUpdateNoteAndThoughtsMutation = (
    options?: Partial<InferMutationOptions<typeof updateNoteAndThoughts>>
  ) => {
    const queryClient = useQueryClient();
    const { useUpdateSyncGraphDataMutation } = useGraphController();
    const { mutateAsync: mutateAsyncGraphData } =
      useUpdateSyncGraphDataMutation();

    return useMutation({
      mutationKey: [REACT_QUERY_KEYS.updateNoteAndThoughts],
      mutationFn: updateNoteAndThoughts,
      ...options,
      onSuccess: async (...args) => {
        try {
          await mutateAsyncGraphData(true);
        } finally {
          await invalidateNotesAndThoughtsQueries(queryClient);
        }
        await options?.onSuccess?.(...args);
      },
    });
  };

  const useFetchAllThoughtsWithEmbeddingsQuery = (
    options?: ReactQueryOptions
  ) =>
    useQuery<Awaited<ReturnType<typeof fetchAllThoughtsWithEmbeddings>>>({
      queryKey: [REACT_QUERY_KEYS.fetchAllThoughtsWithEmbeddings],
      queryFn: fetchAllThoughtsWithEmbeddings,
      ...options,
    });

  const useFetchNotesAndThoughtsQuery = (options?: ReactQueryOptions) =>
    useQuery<Awaited<ReturnType<typeof fetchNotesAndThoughts>>>({
      queryKey: [REACT_QUERY_KEYS.fetchNotesAndThoughts],
      queryFn: fetchNotesAndThoughts,
      refetchOnMount: "always",
      structuralSharing: false,
      ...options,
    });

  const useFetchAllNotesQuery = (options?: ReactQueryOptions) =>
    useQuery<Awaited<ReturnType<typeof fetchAllNotes>>>({
      queryKey: [REACT_QUERY_KEYS.fetchNotes],
      queryFn: fetchAllNotes,
      refetchOnMount: "always",
      structuralSharing: false,
      ...options,
    });

  const useFetchNoteDetails = (id: string, options?: ReactQueryOptions) =>
    useQuery<Awaited<ReturnType<typeof fetchNoteDetails>>>({
      queryKey: [REACT_QUERY_KEYS.fetchNoteDetails, id],
      queryFn: () => fetchNoteDetails(id),
      ...options,
    });

  const useFetchNoteByTopic = (topicId: string, options?: ReactQueryOptions) =>
    useQuery<
      Awaited<ReturnType<typeof fetchNotesByTopicWithAssociatedThoughts>>
    >({
      queryKey: [REACT_QUERY_KEYS.fetchNoteByTopic, topicId],
      queryFn: () => fetchNotesByTopicWithAssociatedThoughts(topicId),
      ...options,
    });

  const useDeleteNoteByIdMutation = (
    options?: Partial<InferMutationOptions<typeof deleteNoteById>>
  ) => {
    const queryClient = useQueryClient();
    const { useUpdateSyncGraphDataMutation } = useGraphController();
    const { mutateAsync: mutateAsyncGraphData } =
      useUpdateSyncGraphDataMutation();
    return useMutation({
      mutationKey: [REACT_QUERY_KEYS.deleteNoteById],
      mutationFn: deleteNoteById,
      ...options,
      onSuccess: async (...args) => {
        try {
          await mutateAsyncGraphData(true);
        } finally {
          await invalidateNotesAndThoughtsQueries(queryClient);
        }
        await options?.onSuccess?.(...args);
      },
    });
  };

  return {
    useGenerateNoteMutation,
    useInsertNoteAndThoughtsMutation,
    useFetchAllThoughtsWithEmbeddingsQuery,
    useFetchNotesAndThoughtsQuery,
    useFetchNoteDetails,
    useSeedDatabaseMutation,
    useUpdateNoteAndThoughtsMutation,
    useDeleteThoughtsByIdsMutation,
    useDeleteNoteByIdMutation,
    useFetchAllNotesQuery,
    useFetchNoteByTopic,
  };
};
