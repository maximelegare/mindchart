import { Embedding } from "@repo/zod-schemas/src/schemas";
import { generateID } from "@/utils/genrateID";
import { PendingEmbedding } from "@repo/zod-schemas";
import { useLlamaEmbeddings } from "@/features/llama/hooks/useLlamaEmbeddings";

export const useGenerateLocalEmbeddingsService = () => {
  const { embed } = useLlamaEmbeddings();

  const generateEmbeddings = async (
    thoughts: PendingEmbedding[]
  ): Promise<Embedding[]> => {
    const embeddings: Embedding[] = [];

    for (const thought of thoughts) {
      const textToEmbed = thought.semanticLabel;
      const vector = await embed(textToEmbed);

      const floatArray = new Float32Array(vector);
      embeddings.push({
        id: generateID(),
        thoughtId: thought.id,
        embedding: floatArray.buffer as any,
        createdAt: new Date().toISOString(),
      });
    }

    return embeddings;
  };
  return { generateEmbeddings };
};
