import { sql } from "drizzle-orm";
import { DB } from "../../../utils/initialize/getOPDatabase";
import { SearchResultsSchema } from "../../../../../zod-schemas/src/client";

/** FTS5 prefix match per token (OR) for search-as-you-type. */
function buildFts5PrefixMatchQuery(query: string): string {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  if (!tokens.length) return "";

  return tokens
    .map((t) => {
      const bare = t.replace(/[^a-z0-9_]/gi, "");
      if (bare.length > 0) return `${bare}*`;
      return `"${t.replace(/"/g, '""')}"*`;
    })
    .join(" OR ");
}

export const searchThoughtsInFTSQuery = async (db: DB, query: string) => {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  try {
    // 1. Ensure your index/triggers are properly applied
    // await ensureThoughtFtsIndex(db);

    const ftsMatch = buildFts5PrefixMatchQuery(normalized);
    if (!ftsMatch) {
      return [];
    }

    // 2. Explicitly scope the search to your text columns, bypassing the unindexed ID
    const scopedMatchQuery = `{title summary semantic_label} : ${ftsMatch}`;

    // 3. Use db.run() instead of execute to interface with the op-sqlite driver session
    const rawResult = await db.run(sql`
      SELECT
        t.id as id,
        t.note_id as noteId,
        COALESCE(n.title, '') as noteTitle,
        COALESCE(t.title, '') as thoughtTitle,
        COALESCE(t.summary, '') as thoughtSummary,
        t.created_at as createdAt
      FROM thought_fts
      JOIN thought t ON t.id = thought_fts.id
      LEFT JOIN note n ON n.id = t.note_id
      WHERE thought_fts MATCH ${scopedMatchQuery}
      ORDER BY bm25(thought_fts)
      LIMIT 20
    `);

    // 4. Safely extract rows across op-sqlite version types
    const rows =
      (rawResult as any).rows?._array || (rawResult as any).rows || [];

    // 5. Validate and parse through your zod schema
    return SearchResultsSchema.parse(rows);
  } catch (error) {
    console.error("searchThoughtsInFTSQuery failed:", error);
    throw error;
  }
};
