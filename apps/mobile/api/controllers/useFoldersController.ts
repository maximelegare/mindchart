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
  getChildFolders,
  getFolderById,
  getFolderContents,
  insertFolder,
  updateFolderLabel,
} from "../endpoints/folders";
import { Folder } from "@repo/zod-schemas/src/schemas";

const invalidateFolderQueries = async (
  queryClient: ReturnType<typeof useQueryClient>
) => {
  await queryClient.invalidateQueries({
    queryKey: [REACT_QUERY_KEYS.fetchAllFolders],
  });
  await queryClient.invalidateQueries({
    queryKey: [REACT_QUERY_KEYS.fetchChildFolders],
  });
  await queryClient.invalidateQueries({
    queryKey: [REACT_QUERY_KEYS.fetchFolderById],
  });
  await queryClient.invalidateQueries({
    queryKey: [REACT_QUERY_KEYS.fetchFolderContents],
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
        await invalidateFolderQueries(queryClient);
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
        await invalidateFolderQueries(queryClient);
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
        await invalidateFolderQueries(queryClient);
      },
    });
  };

  return {
    useFetchAllFoldersQuery,
    useFetchFolderByIdQuery,
    useFetchChildFoldersQuery,
    useFetchFolderContentsQuery,
    useInsertFolderMutation,
    useUpdateFolderLabelMutation,
    useDeleteFolderByPathMutation,
  };
};
