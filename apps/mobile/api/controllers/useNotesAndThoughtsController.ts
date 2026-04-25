import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteNoteById,
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
} from "@/api/endpoints/thoughtsAndNotes";
import {
  deleteThoughtsByIds,
  fetchAllThoughtsWithEmbeddings,
} from "@/api/endpoints/thoughts";
import { useGraphController } from "./useGraphController";

import { useGenerateNoteService } from "@/features/notes/noteCreation/features/generateNote/useGenerateNoteService";
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
        // Runs embeddings service before fetching the rest of the data
        // await runEmbeddingsService();
        await mutateAsyncGraphData(true);
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchNotesAndThoughts],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchAllThoughtsWithEmbeddings],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchGraphData],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchThoughts],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.seedDatabase],
        });
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
      mutationKey: [REACT_QUERY_KEYS.insertNoteAndThoughts], // unique mutation key
      mutationFn: insertNoteAndThoughts,
      onSuccess: async () => {
        // Runs embeddings service before fetching the rest of the data
        // await runEmbeddingsService();
        await mutateAsyncGraphData(true);
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchNotesAndThoughts],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchAllThoughtsWithEmbeddings],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchGraphData],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchThoughts],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.seedDatabase],
        });
      },
      ...options,
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
      onSuccess: async () => {
        await mutateAsyncGraphData(true);
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchNotesAndThoughts],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchAllThoughtsWithEmbeddings],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchGraphData],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchThoughts],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.seedDatabase],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchNoteDetails],
        });
      },
      ...options,
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
      mutationKey: [REACT_QUERY_KEYS.updateNoteAndThoughts], // unique mutation key
      mutationFn: updateNoteAndThoughts,
      onSuccess: async () => {
        // Runs embeddings service before fetching the rest of the data
        // await runEmbeddingsService();
        await mutateAsyncGraphData(true);
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchNotesAndThoughts],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchAllThoughtsWithEmbeddings],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchGraphData],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchThoughts],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.seedDatabase],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchNoteDetails],
        });
      },
      ...options,
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
      ...options,
    });

  const useFetchNoteDetails = (id: string, options?: ReactQueryOptions) =>
    useQuery<Awaited<ReturnType<typeof fetchNoteDetails>>>({
      queryKey: [REACT_QUERY_KEYS.fetchNoteDetails, id],
      queryFn: () => fetchNoteDetails(id),
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
      onSuccess: async () => {
        await mutateAsyncGraphData(true);
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchNotesAndThoughts],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchAllThoughtsWithEmbeddings],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchGraphData],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchThoughts],
        });
        queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.seedDatabase],
        });
      },
      ...options,
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
  };
};
