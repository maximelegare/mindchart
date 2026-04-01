import { getOPDatabase } from "@repo/sqlite";
import { insertPendingEmbeddingsQuery } from "@repo/sqlite";
import { Thought } from "@repo/zod-schemas/client";
import {
  fetchPendingEmbeddings,
  insertEmbeddings,
} from "@/api/endpoints/embeddings";
import { REACT_QUERY_KEYS } from "../endpoints/KEYS";
import { useMutation } from "@tanstack/react-query";
import { Embedding } from "@repo/zod-schemas/src/schemas";
import { useGenerateLocalEmbeddingsService } from "../../features/embeddings/services/useGenerateLocalEmbeddingService";

export const useEmbeddingsController = () => {
  const db = getOPDatabase();

  const useFetchPendingEmbeddings = async () => await fetchPendingEmbeddings();

  const insertPendingEmbeddings = async (data: Array<Thought>) =>
    await insertPendingEmbeddingsQuery(db, data);

  const useInsertEmbeddingsMutation = () =>
    useMutation<
      Awaited<ReturnType<typeof insertEmbeddings>>,
      Error,
      { data: Embedding[] }
    >({
      mutationKey: [REACT_QUERY_KEYS.insertEmbeddings],
      mutationFn: ({ data }) => insertEmbeddings(data),
    });

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

  return {
    useFetchPendingEmbeddings,
    insertPendingEmbeddings,
    useGenerateLocalEmbeddingsMutation,
    useInsertEmbeddingsMutation,
  };
};
