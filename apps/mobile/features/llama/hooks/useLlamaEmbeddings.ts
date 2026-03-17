import { useCallback, useContext } from "react";
import { LlamaContextInstance } from "@/features/llama/context/llamaContext";
import { ModelId } from "../data/types";

export const useLlamaEmbeddings = () => {
  const context = useContext(LlamaContextInstance);
  if (!context) {
    throw new Error("useLlamaEmbeddings must be used within a LlamaProvider");
  }

  /**
   * Generate embedding vector for a single text
   */
  const embed = useCallback(
    async (text: string) => {
      if (!context.embeddingContext) {
        throw new Error("Embedding model not initialized.");
      }

      const { embedding } = await context.embeddingContext.embedding(text);

      // Already Float32Array
      return embedding;
    },
    [context.embeddingContext]
  );

  /**
   * Batch embedding (recommended for multiple notes)
   */
  const embedBatch = useCallback(
    async (texts: string[]) => {
      if (!context.embeddingContext) {
        throw new Error("Embedding model not initialized.");
      }

      const results = await Promise.all(
        texts.map((text) => context.embeddingContext!.embedding(text))
      );

      return results.map((r) => r.embedding);
    },
    [context.embeddingContext]
  );

  return {
    ...context,
    embed,
    embedBatch,
    currentModelId: context.currentEmbeddingModelId as ModelId,
    isReady:
      !!context.embeddingContext &&
      !context.isInitializingEmbedding &&
      !context.isDownloading,
  };
};
