import { DB } from "../../utils/initialize/getOPDatabase";
import { EmbeddingTable, ThoughtTable } from "../../schema.root";
import { eq } from "drizzle-orm";
import {
  deleteContentByIds,
  deleteThoughtFts,
} from "../thoughtContent/typedContent";

export const deleteThoughByIdQuery = async (db: DB, id: string) => {
  return await db.transaction(async (tx) => {
    const dbTx = tx as unknown as DB;
    try {
      const [row] = await tx
        .select({ contentId: ThoughtTable.contentId })
        .from(ThoughtTable)
        .where(eq(ThoughtTable.id, id))
        .limit(1);

      await tx.delete(ThoughtTable).where(eq(ThoughtTable.id, id));
      await tx.delete(EmbeddingTable).where(eq(EmbeddingTable.thoughtId, id));
      await deleteThoughtFts(dbTx, [id]);
      if (row?.contentId) {
        await deleteContentByIds(dbTx, [row.contentId]);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
};
