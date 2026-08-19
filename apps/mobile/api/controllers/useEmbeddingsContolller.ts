import { getOPDatabase } from "@repo/sqlite";
import { insertPendingEmbeddingsQuery } from "@repo/sqlite";
import { Thought } from "@repo/zod-schemas/client";
import {
  fetchPendingEmbeddings,
  insertEmbeddings,
  updateEmbeddings,
} from "@/api/endpoints/embeddings";
import { REACT_QUERY_KEYS } from "../endpoints/KEYS";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Embedding } from "@repo/zod-schemas/src/schemas";
import { useGenerateLocalEmbeddingsService } from "../../features/embeddings/services/useGenerateLocalEmbeddingService";
import { invalidateNotesAndThoughtsQueries } from "../utils/invalidateNotesAndThoughtsQueries";
import { updateSyncGraphData } from "../endpoints/graph";

const markGraphDirty = async (
  queryClient: ReturnType<typeof useQueryClient>
) => {
  await updateSyncGraphData(true);
  await queryClient.invalidateQueries({
    queryKey: [REACT_QUERY_KEYS.fetchSyncGraph],
  });
};

export const useEmbeddingsController = () => {
  const useFetchPendingEmbeddings = async () => await fetchPendingEmbeddings();

  const insertPendingEmbeddings = async (data: Array<Thought>) =>
    await insertPendingEmbeddingsQuery(getOPDatabase(), data);

  const useInsertEmbeddingsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<
      Awaited<ReturnType<typeof insertEmbeddings>>,
      Error,
      { data: Embedding[] }
    >({
      mutationKey: [REACT_QUERY_KEYS.insertEmbeddings],
      mutationFn: ({ data }) => insertEmbeddings(data),
      onSuccess: async () => {
        // Category graph reads thoughts-with-embeddings; note insert often
        // refetches before embedding rows exist, so refresh again here.
        await invalidateNotesAndThoughtsQueries(queryClient);
        await markGraphDirty(queryClient);
      },
    });
  };

  const useGenerateLocalEmbeddingsMutation = () => {
    const { generateEmbeddings } = useGenerateLocalEmbeddingsService();

    return useMutation<
      Awaited<ReturnType<typeof generateEmbeddings>>,
      Error,
      { thoughts: Thought[] }
    >({
      mutationKey: [REACT_QUERY_KEYS.generateLocalEmbeddings],
      mutationFn: ({ thoughts }) => generateEmbeddings(thoughts),
    });
  };

  const useUpdateEmbeddingsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<
      Awaited<ReturnType<typeof updateEmbeddings>>,
      Error,
      { data: Embedding[] }
    >({
      mutationKey: [REACT_QUERY_KEYS.updateEmbeddings],
      mutationFn: ({ data }) => updateEmbeddings(data),
      onSuccess: async () => {
        await invalidateNotesAndThoughtsQueries(queryClient);
        await markGraphDirty(queryClient);
      },
    });
  };

  return {
    useFetchPendingEmbeddings,
    useUpdateEmbeddingsMutation,
    insertPendingEmbeddings,
    useGenerateLocalEmbeddingsMutation,
    useInsertEmbeddingsMutation,
  };
};
