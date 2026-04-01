import { useCallback, useContext } from "react";
import { LlamaContextInstance } from "@/features/llama/context/llamaContext";
import { ModelId } from "../data/types";

/**
 * llama.rn types: `{ embedding: number[] }`.
 * JSI may return `number[]`, `Float32Array`, other TypedArrays, or array-like objects.
 */
function normalizeEmbeddingVector(embeddingResult: unknown): Float32Array {
  if (embeddingResult == null) {
    return new Float32Array();
  }
  if (embeddingResult instanceof Float32Array) {
    return embeddingResult;
  }
  if (Array.isArray(embeddingResult)) {
    return new Float32Array(embeddingResult);
  }
  if (ArrayBuffer.isView(embeddingResult)) {
    return Float32Array.from(embeddingResult as unknown as ArrayLike<number>);
  }
  if (
    typeof embeddingResult === "object" &&
    embeddingResult !== null &&
    "embedding" in embeddingResult
  ) {
    return normalizeEmbeddingVector(
      (embeddingResult as { embedding: unknown }).embedding
    );
  }
  // Array-like plain object from some RN/JSI bridges
  if (
    typeof embeddingResult === "object" &&
    embeddingResult !== null &&
    "length" in embeddingResult &&
    typeof (embeddingResult as { length: unknown }).length === "number"
  ) {
    const len = (embeddingResult as { length: number }).length;
    if (len > 0) {
      try {
        return Float32Array.from(
          Array.from(embeddingResult as ArrayLike<number>)
        );
      } catch {
        /* fall through */
      }
    }
  }
  return new Float32Array();
}

export const useLlamaEmbeddings = () => {
  const context = useContext(LlamaContextInstance);
  if (!context) {
    throw new Error("useLlamaEmbeddings must be used within a LlamaProvider");
  }

  /**
   * Generate embedding vector for a single text
   */
  const embed = useCallback(
    async (
      text: string,
      task: "query" | "document" | "clustering" | "classification"
    ) => {
      if (!context.embeddingContext) {
        throw new Error("Embedding model not initialized.");
      }

      let prefix = "";
      switch (task) {
        case "query":
          prefix = "search_query: ";
          break;
        case "document":
          prefix = "search_document: ";
          break;
        case "clustering":
          prefix = "clustering: ";
          break;
        case "classification":
          prefix = "classification: ";
          break;
        default:
          throw new Error("Invalid task.");
      }

      const formattedText = `${prefix}${text.trim().toLowerCase()}`;

      const embeddingResult =
        await context.embeddingContext.embedding(formattedText);
      return normalizeEmbeddingVector(embeddingResult);
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

      return results.map((r) => normalizeEmbeddingVector(r));
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
