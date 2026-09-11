import { Embedding, PendingEmbedding } from "@repo/zod-schemas";

import { generateID } from "@/utils/genrateID";
import { useLlamaEmbeddings } from "@/features/llama/hooks/useLlamaEmbeddings";

export const useGenerateLocalEmbeddingsService = () => {
  const { embed } = useLlamaEmbeddings();

  const generateEmbeddings = async (
    thoughts: PendingEmbedding[]
  ): Promise<Embedding[]> => {
    const embeddings: Embedding[] = [];

    for (const thought of thoughts) {
      const textToEmbed = thought.semanticLabel;
      const vector = await embed(textToEmbed, "document");

      const floatArray =
        vector instanceof Float32Array
          ? vector.slice()
          : new Float32Array(vector);
      embeddings.push({
        id: generateID(),
        thoughtId: thought.id,
        embedding: floatArray.buffer as unknown as Embedding["embedding"],
        createdAt: new Date().toISOString(),
      });
    }

    return embeddings;
  };
  return { generateEmbeddings };
};
