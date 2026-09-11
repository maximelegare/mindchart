import { sql } from "drizzle-orm";
import { NoteTable } from "../../../schema.root";
import { DB } from "../../../utils/initialize/getOPDatabase";
import {
  PaginatedSearchResultsSchema,
  type SearchResultItemSchemaModel,
} from "@repo/zod-schemas";
import {
  buildNoteListWhere,
  noteListOrderBy,
  type NoteListFilters,
  type NoteListSortDirection,
  type NoteListSortField,
} from "../../notes/noteListQuery";

/** Minimum chars before a token is used in FTS (1-char prefixes match almost everything). */
const MIN_FTS_TOKEN_LEN = 2;
const DEFAULT_PAGE_SIZE = 25;
const TRANSCRIPT_SNIPPET_WINDOW = 80;

export type SearchNotesQueryOptions = {
  includeTranscript?: boolean;
  limit?: number;
  offset?: number;
  sortField?: NoteListSortField;
  sortDirection?: NoteListSortDirection;
  filters?: NoteListFilters;
};

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

function extractRows<T>(result: { rows?: unknown }): T[] {
  const rows = result.rows as unknown;
  if (Array.isArray(rows)) return rows as T[];
  if (rows && typeof rows === "object" && "_array" in rows) {
    return (rows as { _array: T[] })._array;
  }
  return [];
}

function snippetAround(text: string, query: string, window: number): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return "";
  const start = Math.max(0, idx - window);
  const end = Math.min(text.length, idx + query.length + window);
  const prefix = start > 0 ? "… " : "";
  const suffix = end < text.length ? " …" : "";
  return `${prefix}${text.slice(start, end)}${suffix}`;
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

function inList(ids: string[]) {
  return sql.join(
    ids.map((id) => sql`${id}`),
    sql`, `
  );
}

export const searchThoughtsInFTSQuery = async (
  db: DB,
  query: string,
  options: SearchNotesQueryOptions = {}
) => {
  const normalized = query.trim().toLowerCase();
  const includeTranscript = Boolean(options.includeTranscript);
  const limit = Math.max(1, options.limit ?? DEFAULT_PAGE_SIZE);
  const offset = Math.max(0, options.offset ?? 0);
  const sortField = options.sortField ?? "createdAt";
  const sortDirection = options.sortDirection ?? "asc";
  const filterWhere = buildNoteListWhere(options.filters);
  const filterClause = filterWhere ? sql`AND ${filterWhere}` : sql``;
  const orderBy = noteListOrderBy(sortField, sortDirection);

  if (!normalized || normalized.length < MIN_FTS_TOKEN_LEN) {
    return PaginatedSearchResultsSchema.parse({ items: [], totalCount: 0 });
  }

  const { ftsMatch, isTooShort } = buildFts5PhraseQuery(normalized);
  if (isTooShort || !ftsMatch) {
    return PaginatedSearchResultsSchema.parse({ items: [], totalCount: 0 });
  }

  const scopedMatchQuery = `{title summary semantic_label} : ${ftsMatch}`;

  let thoughtHitNoteIds: string[] = [];
  try {
    const hitResult = await db.run(sql`
      SELECT DISTINCT t.note_id as noteId
      FROM thought_fts
      JOIN thought t ON t.id = thought_fts.id
      WHERE thought_fts MATCH ${scopedMatchQuery}
    `);
    thoughtHitNoteIds = extractRows<{ noteId: string }>(hitResult)
      .map((row) => row.noteId)
      .filter(Boolean);
  } catch (error) {
    console.error("searchThoughtsInFTSQuery thought match failed:", error);
  }

  const thoughtHitClause =
    thoughtHitNoteIds.length > 0
      ? sql`OR ${NoteTable.id} IN (${inList(thoughtHitNoteIds)})`
      : sql``;

  try {
    const pageResult = await db.run(sql`
      SELECT
        ${NoteTable.id} as noteId,
        COALESCE(${NoteTable.title}, '') as noteTitle,
        ${NoteTable.createdAt} as createdAt,
        COALESCE(${NoteTable.rawText}, '') as rawText,
        COUNT(*) OVER() as totalCount
      FROM ${NoteTable}
      WHERE
        (
          instr(lower(COALESCE(${NoteTable.title}, '')), ${normalized}) > 0
          OR (
            ${includeTranscript ? 1 : 0}
            AND instr(lower(COALESCE(${NoteTable.rawText}, '')), ${normalized}) > 0
          )
          ${thoughtHitClause}
        )
        ${filterClause}
      ORDER BY ${orderBy}
      LIMIT ${limit} OFFSET ${offset}
    `);

    const pageNotes = extractRows<{
      noteId: string;
      noteTitle: string;
      createdAt: string;
      rawText: string;
      totalCount: number | string;
    }>(pageResult);

    const totalCount = Number(pageNotes[0]?.totalCount ?? 0);
    const pageNoteIds = pageNotes.map((row) => row.noteId).filter(Boolean);

    const thoughtRowsByNote = new Map<string, SearchResultItemSchemaModel[]>();

    const appendThought = (
      row: {
        id: string;
        noteId: string;
        categoryId: string | null;
        noteTitle: string;
        thoughtTitle: string;
        thoughtSummary: string;
        createdAt: string;
      },
      seenIds: Set<string>
    ) => {
      if (!row.id || seenIds.has(row.id)) return;
      seenIds.add(row.id);
      const list = thoughtRowsByNote.get(row.noteId) ?? [];
      list.push({
        id: row.id,
        noteId: row.noteId,
        noteTitle: row.noteTitle,
        thoughtTitle: row.thoughtTitle ?? "",
        thoughtSummary: row.thoughtSummary ?? "",
        categoryId: row.categoryId ?? "",
        createdAt: String(row.createdAt ?? ""),
        transcriptSnippet: "",
      });
      thoughtRowsByNote.set(row.noteId, list);
    };

    const seenThoughtIds = new Set<string>();

    if (pageNoteIds.length > 0 && thoughtHitNoteIds.length > 0) {
      const thoughtPageIds = pageNoteIds.filter((id) =>
        thoughtHitNoteIds.includes(id)
      );
      if (thoughtPageIds.length > 0) {
        const thoughtResult = await db.run(sql`
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
            AND t.note_id IN (${inList(thoughtPageIds)})
          ORDER BY bm25(thought_fts)
        `);

        const thoughtRows = extractRows<{
          id: string;
          noteId: string;
          categoryId: string | null;
          noteTitle: string;
          thoughtTitle: string;
          thoughtSummary: string;
          createdAt: string;
        }>(thoughtResult);

        for (const row of thoughtRows) {
          if (
            !hasSubStringMatch(
              getRowSearchableText({
                noteTitle: row.noteTitle,
                thoughtTitle: row.thoughtTitle,
                thoughtSummary: row.thoughtSummary,
              }),
              normalized
            )
          ) {
            continue;
          }
          appendThought(row, seenThoughtIds);
        }
      }
    }

    const notesMissingThoughts = pageNoteIds.filter(
      (id) => (thoughtRowsByNote.get(id)?.length ?? 0) === 0
    );
    if (notesMissingThoughts.length > 0) {
      const noteThoughtsResult = await db.run(sql`
        SELECT
          t.id as id,
          t.note_id as noteId,
          t.category_id as categoryId,
          COALESCE(n.title, '') as noteTitle,
          COALESCE(t.title, '') as thoughtTitle,
          COALESCE(t.summary, '') as thoughtSummary,
          t.created_at as createdAt
        FROM thought t
        LEFT JOIN note n ON n.id = t.note_id
        WHERE t.note_id IN (${inList(notesMissingThoughts)})
        ORDER BY t.created_at ASC
      `);

      for (const row of extractRows<{
        id: string;
        noteId: string;
        categoryId: string | null;
        noteTitle: string;
        thoughtTitle: string;
        thoughtSummary: string;
        createdAt: string;
      }>(noteThoughtsResult)) {
        appendThought(row, seenThoughtIds);
      }
    }

    const items: SearchResultItemSchemaModel[] = [];
    for (const note of pageNotes) {
      const transcriptSnippet =
        includeTranscript && hasSubStringMatch(note.rawText ?? "", normalized)
          ? snippetAround(
              note.rawText ?? "",
              normalized,
              TRANSCRIPT_SNIPPET_WINDOW
            )
          : "";
      const thoughtHits = thoughtRowsByNote.get(note.noteId) ?? [];
      if (thoughtHits.length > 0) {
        for (const thought of thoughtHits) {
          items.push({
            ...thought,
            noteTitle: note.noteTitle || thought.noteTitle,
            createdAt: String(note.createdAt ?? thought.createdAt ?? ""),
            transcriptSnippet,
          });
        }
        continue;
      }

      items.push({
        id: `note:${note.noteId}`,
        noteId: note.noteId,
        noteTitle: note.noteTitle ?? "",
        thoughtTitle: "",
        thoughtSummary: "",
        categoryId: "",
        createdAt: String(note.createdAt ?? ""),
        transcriptSnippet,
      });
    }

    return PaginatedSearchResultsSchema.parse({ items, totalCount });
  } catch (error) {
    console.error("searchThoughtsInFTSQuery failed:", error);
    throw error;
  }
};
