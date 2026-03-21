import { generateID } from "../../utils/generareID";
import { EmbeddingTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { Embedding } from "../../../../zod-schemas/src/schemas";

export const insertEmbeddingsQuery = async (db: DB, data: Embedding[]) => {
  return db.transaction(async (tx) => {
    try {
      await Promise.all(
        data.map(({ thoughtId, embedding }) => {
          if (!embedding) return;

          // Pass the Float32Array directly!
          // Drizzle's customType.toDriver will take this and convert it.
          const floatArray = new Float32Array(embedding);

          return tx.insert(EmbeddingTable).values({
            id: generateID(),
            thoughtId,
            embedding: floatArray, // No .buffer, no 'as any'
            status: "completed",
          });
        })
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
};
