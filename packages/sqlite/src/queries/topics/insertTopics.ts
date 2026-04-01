import { TopicTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { Topic } from "../../../../zod-schemas/src/schemas";

export const insertTopicsQuery = async (db: DB, data: Topic[]) => {
  return db.transaction(async (tx) => {
    try {
      await Promise.all(
        data.map(({ id, name, embedding }) => {
          if (!embedding) return;

          // Pass the Float32Array directly!
          // Drizzle's customType.toDriver will take this and convert it.
          const floatArray = new Float32Array(embedding);

          return tx.insert(TopicTable).values({
            id,
            name,
            embedding: floatArray, // No .buffer, no 'as any'
            createdAt: new Date().toISOString(),
          });
        })
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
};
