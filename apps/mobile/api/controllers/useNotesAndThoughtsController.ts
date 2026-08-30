import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  deleteNoteById,
  fetchAllNotes,
  insertNoteAndThoughts,
  updateNoteAndThoughts,
  updateNoteFeeling,
  updateNoteFolderId,
  updateNoteLastViewedAt,
  updateNoteLocation,
  updateNotePersons,
} from "@/api/endpoints/notes";
import {
  InferMutationOptions,
  REACT_QUERY_KEYS,
  ReactQueryOptions,
} from "@/api/endpoints/KEYS";
import {
  fetchNoteDetails,
  fetchNotesAndThoughts,
  fetchPaginatedNotesAndThoughts,
  type PaginatedNotesAndThoughtsRequest,
} from "@/api/endpoints/thoughtsAndNotes";
import { fetchPaginatedNotes } from "@/api/endpoints/paginatedNotes";
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
      // Float32Array rows + folder joins confuse structural sharing after moves.
      structuralSharing: false,
      refetchOnMount: "always",
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

  const useFetchPaginatedNotesQuery = (
    params: PaginatedNotesAndThoughtsRequest,
    options?: ReactQueryOptions
  ) =>
    useQuery<Awaited<ReturnType<typeof fetchPaginatedNotes>>>({
      queryKey: [REACT_QUERY_KEYS.fetchPaginatedNotes, params],
      queryFn: () => fetchPaginatedNotes(params),
      placeholderData: keepPreviousData,
      refetchOnMount: "always",
      structuralSharing: false,
      ...options,
    });

  const useFetchPaginatedNotesAndThoughtsQuery = (
    params: PaginatedNotesAndThoughtsRequest,
    options?: ReactQueryOptions
  ) =>
    useQuery<Awaited<ReturnType<typeof fetchPaginatedNotesAndThoughts>>>({
      queryKey: [REACT_QUERY_KEYS.fetchPaginatedNotesAndThoughts, params],
      queryFn: () => fetchPaginatedNotesAndThoughts(params),
      placeholderData: keepPreviousData,
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

  const useUpdateNoteFolderIdMutation = () => {
    const queryClient = useQueryClient();
    const { useUpdateSyncGraphDataMutation } = useGraphController();
    const { mutateAsync: mutateAsyncGraphData } =
      useUpdateSyncGraphDataMutation();
    return useMutation<
      Awaited<ReturnType<typeof updateNoteFolderId>>,
      Error,
      { noteId: string; folderId: string | null }
    >({
      mutationKey: [REACT_QUERY_KEYS.updateNoteFolderId],
      mutationFn: updateNoteFolderId,
      onSuccess: async () => {
        try {
          await mutateAsyncGraphData(true);
        } finally {
          await invalidateNotesAndThoughtsQueries(queryClient);
          await queryClient.invalidateQueries({
            queryKey: [REACT_QUERY_KEYS.fetchAllFoldersWithNotesInfos],
          });
          await queryClient.invalidateQueries({
            queryKey: [REACT_QUERY_KEYS.fetchFolderContents],
          });
        }
      },
    });
  };

  const useUpdateNotePersonsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<
      Awaited<ReturnType<typeof updateNotePersons>>,
      Error,
      {
        noteId: string;
        persons: NonNullable<
          Parameters<typeof updateNotePersons>[0]["persons"]
        >;
      }
    >({
      mutationKey: [REACT_QUERY_KEYS.updateNotePersons],
      mutationFn: updateNotePersons,
      onSuccess: async (_data, variables) => {
        // Avoid broad list invalidation — it remounts the note page header.
        await queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchNoteDetails, variables.noteId],
        });
      },
    });
  };

  const useUpdateNoteFeelingMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<
      Awaited<ReturnType<typeof updateNoteFeeling>>,
      Error,
      {
        noteId: string;
        feeling: Parameters<typeof updateNoteFeeling>[0]["feeling"];
      }
    >({
      mutationKey: [REACT_QUERY_KEYS.updateNoteFeeling],
      mutationFn: updateNoteFeeling,
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchNoteDetails, variables.noteId],
        });
      },
    });
  };

  const useUpdateNoteLocationMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<
      Awaited<ReturnType<typeof updateNoteLocation>>,
      Error,
      {
        noteId: string;
        locationId: string | null;
      }
    >({
      mutationKey: [REACT_QUERY_KEYS.updateNoteLocation],
      mutationFn: updateNoteLocation,
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries({
          queryKey: [REACT_QUERY_KEYS.fetchNoteDetails, variables.noteId],
        });
      },
    });
  };

  const useUpdateNoteLastViewedAtMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<
      Awaited<ReturnType<typeof updateNoteLastViewedAt>>,
      Error,
      string
    >({
      mutationKey: [REACT_QUERY_KEYS.updateNoteLastViewedAt],
      mutationFn: updateNoteLastViewedAt,
      onSuccess: async (noteId) => {
        // Refetch the details so the updated timestamp is reflected without
        // invalidating the broader lists.
        await queryClient.refetchQueries({
          queryKey: [REACT_QUERY_KEYS.fetchNoteDetails, noteId],
        });
      },
    });
  };

  return {
    useGenerateNoteMutation,
    useInsertNoteAndThoughtsMutation,
    useFetchAllThoughtsWithEmbeddingsQuery,
    useFetchNotesAndThoughtsQuery,
    useFetchPaginatedNotesQuery,
    useFetchPaginatedNotesAndThoughtsQuery,
    useFetchNoteDetails,
    useSeedDatabaseMutation,
    useUpdateNoteAndThoughtsMutation,
    useDeleteThoughtsByIdsMutation,
    useDeleteNoteByIdMutation,
    useUpdateNoteFolderIdMutation,
    useUpdateNotePersonsMutation,
    useUpdateNoteFeelingMutation,
    useUpdateNoteLocationMutation,
    useUpdateNoteLastViewedAtMutation,
    useFetchAllNotesQuery,
  };
};
