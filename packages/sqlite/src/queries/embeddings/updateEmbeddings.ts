import { EmbeddingTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { Embedding } from "@repo/zod-schemas";
import { eq } from "drizzle-orm";

export const updateEmbeddingsQuery = async (db: DB, data: Embedding[]) => {
  return db.transaction(async (tx) => {
    try {
      await Promise.all(
        data.map(({ thoughtId, embedding }) => {
          if (!embedding) return;

          // Pass the Float32Array directly!
          // Drizzle's customType.toDriver will take this and convert it.
          const floatArray = new Float32Array(embedding);

          return tx
            .update(EmbeddingTable)
            .set({
              embedding: floatArray, // No .buffer, no 'as any'
            })
            .where(eq(EmbeddingTable.thoughtId, thoughtId));
        })
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
};
