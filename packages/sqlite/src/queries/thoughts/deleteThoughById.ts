import { DB } from "../../utils/initialize/getOPDatabase";
import { EmbeddingTable, ThoughtTable } from "../../schema.root";
import { eq, sql } from "drizzle-orm";

export const deleteThoughByIdQuery = async (db: DB, id: string) => {
  return await db.transaction(async (tx) => {
    try {
      await tx.delete(ThoughtTable).where(eq(ThoughtTable.id, id));

      await tx.delete(EmbeddingTable).where(eq(EmbeddingTable.thoughtId, id));

      await tx.run(sql`
        DELETE FROM thought_fts
        WHERE id = ${id}
      `);
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
};
