import { and, asc, count, desc, eq, inArray, sql, type SQL } from "drizzle-orm";
import { NoteTable, PersonToNoteTable, ThoughtTable } from "../../schema.root";
import { type DB } from "../../utils/initialize/getOPDatabase";

export type NoteListSortBy = "newest" | "oldest" | "az" | "za";

export type NoteListFilters = {
  folderId?: string | null;
  categoryId?: string | null;
  personIds?: string[];
  feelings?: number[];
  locationIds?: string[];
};

export type NoteListQueryParams = {
  limit: number;
  offset: number;
  sortBy: NoteListSortBy;
  filters?: NoteListFilters;
};

export const noteListOrderBy = (sortBy: NoteListSortBy) => {
  switch (sortBy) {
    case "oldest":
      return asc(NoteTable.createdAt);
    case "az":
      return asc(NoteTable.title);
    case "za":
      return desc(NoteTable.title);
    case "newest":
    default:
      return desc(NoteTable.createdAt);
  }
};

/** Shared WHERE clauses for paginated note list + count queries. */
export const buildNoteListWhere = (
  filters?: NoteListFilters
): SQL | undefined => {
  if (!filters) return undefined;

  const clauses: SQL[] = [];

  if (filters.folderId) {
    clauses.push(eq(NoteTable.folderId, filters.folderId));
  }

  if (filters.categoryId) {
    clauses.push(
      sql`EXISTS (
        SELECT 1 FROM ${ThoughtTable}
        WHERE ${ThoughtTable.noteId} = ${NoteTable.id}
        AND ${ThoughtTable.categoryId} = ${filters.categoryId}
      )`
    );
  }

  if (filters.feelings?.length) {
    clauses.push(inArray(NoteTable.feeling, filters.feelings));
  }

  if (filters.locationIds?.length) {
    clauses.push(inArray(NoteTable.locationId, filters.locationIds));
  }

  if (filters.personIds?.length) {
    clauses.push(
      sql`EXISTS (
        SELECT 1 FROM ${PersonToNoteTable}
        WHERE ${PersonToNoteTable.noteId} = ${NoteTable.id}
        AND ${PersonToNoteTable.personId} IN (${sql.join(
          filters.personIds.map((id) => sql`${id}`),
          sql`, `
        )})
      )`
    );
  }

  if (!clauses.length) return undefined;
  return and(...clauses);
};

export const countNotesQuery = async (
  db: DB,
  params: Pick<NoteListQueryParams, "filters">
): Promise<number> => {
  const where = buildNoteListWhere(params.filters);
  const rows = await db.select({ total: count() }).from(NoteTable).where(where);
  return Number(rows[0]?.total ?? 0);
};
