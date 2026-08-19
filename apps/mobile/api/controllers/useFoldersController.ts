import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { REACT_QUERY_KEYS, ReactQueryOptions } from "@/api/endpoints/KEYS";
import {
  deleteFolderByPath,
  getAllFolders,
  getAllFoldersWithNotesInfos,
  getChildFolders,
  getFolderById,
  getFolderContents,
  insertFolder,
  moveFolder,
  updateFolderLabel,
} from "../endpoints/folders";
import { updateSyncGraphData } from "../endpoints/graph";
import { Folder } from "@repo/zod-schemas/src/schemas";
import { invalidateNotesAndThoughtsQueries } from "../utils/invalidateNotesAndThoughtsQueries";

const markGraphDirty = async (
  queryClient: ReturnType<typeof useQueryClient>
) => {
  await updateSyncGraphData(true);
  await queryClient.invalidateQueries({
    queryKey: [REACT_QUERY_KEYS.fetchSyncGraph],
  });
};

export const useFoldersController = () => {
  const useFetchAllFoldersQuery = (options?: ReactQueryOptions) =>
    useQuery<Awaited<ReturnType<typeof getAllFolders>>>({
      queryKey: [REACT_QUERY_KEYS.fetchAllFolders],
      queryFn: getAllFolders,
      staleTime: 60_000,
      placeholderData: keepPreviousData,
      ...options,
    });

  const useFetchAllFoldersWithNotesInfosQuery = (options?: ReactQueryOptions) =>
    useQuery<Awaited<ReturnType<typeof getAllFoldersWithNotesInfos>>>({
      queryKey: [REACT_QUERY_KEYS.fetchAllFoldersWithNotesInfos],
      queryFn: getAllFoldersWithNotesInfos,
      staleTime: 60_000,
      placeholderData: keepPreviousData,
      ...options,
    });

  const useFetchFolderByIdQuery = (
    id: string | null,
    options?: ReactQueryOptions
  ) =>
    useQuery<Awaited<ReturnType<typeof getFolderById>>>({
      queryKey: [REACT_QUERY_KEYS.fetchFolderById, id],
      queryFn: () => getFolderById(id!),
      enabled: !!id,
      ...options,
    });

  const useFetchChildFoldersQuery = (
    parentPath: string | null,
    options?: ReactQueryOptions
  ) =>
    useQuery<Awaited<ReturnType<typeof getChildFolders>>>({
      queryKey: [REACT_QUERY_KEYS.fetchChildFolders, parentPath],
      queryFn: () => getChildFolders(parentPath),
      staleTime: 60_000,
      placeholderData: keepPreviousData,
      ...options,
    });

  const useFetchFolderContentsQuery = (
    folderId: string | null,
    options?: ReactQueryOptions
  ) =>
    useQuery<Awaited<ReturnType<typeof getFolderContents>>>({
      queryKey: [REACT_QUERY_KEYS.fetchFolderContents, folderId],
      queryFn: () => getFolderContents(folderId!),
      enabled: !!folderId,
      ...options,
    });

  const useInsertFolderMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<
      Awaited<ReturnType<typeof insertFolder>>,
      Error,
      { data: Folder }
    >({
      mutationKey: [REACT_QUERY_KEYS.insertFolder],
      mutationFn: ({ data }) => insertFolder(data),
      onSuccess: async () => {
        // Category graph joins thoughts → note.folder + folder paths; folder-only
        // invalidation leaves stale thought folderPath/attach data in cache.
        await invalidateNotesAndThoughtsQueries(queryClient);
        await markGraphDirty(queryClient);
      },
    });
  };

  const useUpdateFolderLabelMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<
      Awaited<ReturnType<typeof updateFolderLabel>>,
      Error,
      { id: string; label: string }
    >({
      mutationKey: [REACT_QUERY_KEYS.updateFolderLabel],
      mutationFn: (data) => updateFolderLabel(data),
      onSuccess: async () => {
        await invalidateNotesAndThoughtsQueries(queryClient);
        await markGraphDirty(queryClient);
      },
    });
  };

  const useDeleteFolderByPathMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<
      Awaited<ReturnType<typeof deleteFolderByPath>>,
      Error,
      { path: string }
    >({
      mutationKey: [REACT_QUERY_KEYS.deleteFolderByPath],
      mutationFn: ({ path }) => deleteFolderByPath(path),
      onSuccess: async () => {
        await invalidateNotesAndThoughtsQueries(queryClient);
        await markGraphDirty(queryClient);
      },
    });
  };

  const useMoveFolderMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<
      Awaited<ReturnType<typeof moveFolder>>,
      Error,
      { folderId: string; newParentPath: string | null }
    >({
      mutationKey: [REACT_QUERY_KEYS.moveFolder],
      mutationFn: (data) => moveFolder(data),
      onSuccess: async () => {
        await invalidateNotesAndThoughtsQueries(queryClient);
        await markGraphDirty(queryClient);
      },
    });
  };

  return {
    useFetchAllFoldersQuery,
    useFetchAllFoldersWithNotesInfosQuery,
    useFetchFolderByIdQuery,
    useFetchChildFoldersQuery,
    useFetchFolderContentsQuery,
    useInsertFolderMutation,
    useUpdateFolderLabelMutation,
    useDeleteFolderByPathMutation,
    useMoveFolderMutation,
  };
};
