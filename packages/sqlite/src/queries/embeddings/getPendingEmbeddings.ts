import { EmbeddingTable, ThoughtTable } from "../../schema.root";
import { type DB } from "../../utils/initialize/getOPDatabase";
import { eq } from "drizzle-orm";

export const getPendingEmbeddingsQuery = async (db: DB) => {
  try {
    return await db
      .select({
        id: EmbeddingTable.id,
        semanticLabel: ThoughtTable.semanticLabel,
        thoughtId: ThoughtTable.id,
      })
      .from(EmbeddingTable)
      .where(eq(EmbeddingTable.status, "pending"))
      .leftJoin(ThoughtTable, eq(ThoughtTable.id, EmbeddingTable.thoughtId))
      .limit(30);
  } catch (error) {
    console.error(error);
  }
};
