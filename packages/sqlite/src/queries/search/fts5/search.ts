import { sql } from "drizzle-orm";
import { DB } from "../../../utils/initialize/getOPDatabase";
import { SearchResultsSchema } from "../../../../../zod-schemas/src/client";

/** Minimum chars before a token is used in FTS (1-char prefixes match almost everything). */
const MIN_FTS_TOKEN_LEN = 2;

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True if text contains the raw query string as a substring (case-insensitive). */
function hasSubStringMatch(text: string, query: string): boolean {
  if (query.length < MIN_FTS_TOKEN_LEN) return false;
  return new RegExp(escapeRegex(query), "i").test(text);
}

function getRowSearchableText(row: {
  noteTitle: string;
  thoughtTitle: string;
  thoughtSummary: string;
}): string {
  return `${row.noteTitle} ${row.thoughtTitle} ${row.thoughtSummary}`;
}

/**
 * FTS5 phrase query match. Multi-token strings are searched as contiguous text sequences.
 */
function buildFts5PhraseQuery(query: string): {
  ftsMatch: string;
  isTooShort: boolean;
} {
  const normalized = query.trim();
  if (normalized.length < MIN_FTS_TOKEN_LEN) {
    return { ftsMatch: "", isTooShort: true };
  }

  const safeQuery = normalized.replace(/"/g, '""');
  const ftsMatch = `"${safeQuery}"*`;

  return { ftsMatch, isTooShort: false };
}

export const searchThoughtsInFTSQuery = async (db: DB, query: string) => {
  const normalized = query.trim().toLowerCase();

  if (!normalized || normalized.length < MIN_FTS_TOKEN_LEN) {
    return [];
  }

  try {
    const { ftsMatch, isTooShort } = buildFts5PhraseQuery(normalized);

    if (isTooShort || !ftsMatch) {
      return [];
    }

    const scopedMatchQuery = `{title summary semantic_label} : ${ftsMatch}`;

    const rawResult = await db.run(sql`
      SELECT
        t.id as id,
        t.note_id as noteId,
        t.category_id as categoryId,
        COALESCE(n.title, '') as noteTitle,
        COALESCE(t.title, '') as thoughtTitle,
        COALESCE(t.summary, '') as thoughtSummary,
        t.created_at as createdAt
      FROM thought_fts
      JOIN thought t ON t.id = thought_fts.id
      LEFT JOIN note n ON n.id = t.note_id
      WHERE thought_fts MATCH ${scopedMatchQuery}
      ORDER BY bm25(thought_fts)
    `);

    const rows =
      (rawResult as any).rows?._array || (rawResult as any).rows || [];

    const filteredRows = rows.filter(
      (row: {
        noteTitle: string;
        thoughtTitle: string;
        thoughtSummary: string;
      }) => hasSubStringMatch(getRowSearchableText(row), normalized)
    );

    return SearchResultsSchema.parse(filteredRows);
  } catch (error) {
    console.error("searchThoughtsInFTSQuery failed:", error);
    throw error;
  }
};
