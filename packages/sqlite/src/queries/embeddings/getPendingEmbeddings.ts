import { eq, sql } from "drizzle-orm";
import {
  CheckboxContentTable,
  EmbeddingTable,
  ListItemContentTable,
  TextContentTable,
  ThoughtTable,
} from "../../schema.root";
import { type DB } from "../../utils/initialize/getOPDatabase";

export const getPendingEmbeddingsQuery = async (db: DB) => {
  try {
    return await db
      .select({
        id: EmbeddingTable.id,
        semanticLabel: ThoughtTable.semanticLabel,
        thoughtId: ThoughtTable.id,
        text: sql<string>`COALESCE(
          ${TextContentTable.text},
          ${ListItemContentTable.text},
          ${CheckboxContentTable.text},
          ''
        )`,
      })
      .from(EmbeddingTable)
      .where(eq(EmbeddingTable.status, "pending"))
      .leftJoin(ThoughtTable, eq(ThoughtTable.id, EmbeddingTable.thoughtId))
      .leftJoin(
        TextContentTable,
        eq(TextContentTable.id, ThoughtTable.contentId)
      )
      .leftJoin(
        ListItemContentTable,
        eq(ListItemContentTable.id, ThoughtTable.contentId)
      )
      .leftJoin(
        CheckboxContentTable,
        eq(CheckboxContentTable.id, ThoughtTable.contentId)
      )
      .limit(30);
  } catch (error) {
    console.error(error);
  }
};
