import { DB } from "../../utils/initialize/getOPDatabase";
import { EmbeddingTable, ThoughtTable } from "../../schema.root";
import { eq } from "drizzle-orm";

export const deleteThoughByIdQuery = async (db: DB, id: string) => {
  return await db.transaction(async (tx) => {
    try {
      await tx.delete(ThoughtTable).where(eq(ThoughtTable.id, id));
      await tx.delete(EmbeddingTable).where(eq(EmbeddingTable.thoughtId, id));
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
};
