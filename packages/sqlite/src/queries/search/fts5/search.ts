import { sql } from "drizzle-orm";
import { DB } from "../../../utils/initialize/getOPDatabase";
import { SearchResultsSchema } from "../../../../../zod-schemas/src/client";

export const searchThoughtsInFTSQuery = async (db: DB, query: string) => {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  try {
    const results = await db.all(sql`
      SELECT
        t.id as id,
        t.note_id as noteId,
        n.title as noteTitle,
        t.title as thoughtTitle,
        t.summary as thoughtSummary,
        t.created_at as createdAt
      FROM thought_fts f
      JOIN thought t ON t.id = f.id
      JOIN note n ON n.id = t.note_id
      WHERE thought_fts MATCH ${normalized}
      ORDER BY bm25(thought_fts)
      LIMIT 20;
    `);

    return SearchResultsSchema.parse(results);
  } catch (error) {
    console.error("searchThoughtsInFTSQuery failed:", error);
    throw error;
  }
};
