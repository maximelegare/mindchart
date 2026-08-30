import { eq } from "drizzle-orm";
import { FolderTable, NoteTable } from "../../schema.root";
import { type DB } from "../../utils/initialize/getOPDatabase";
import {
  buildNoteListWhere,
  countNotesQuery,
  noteListOrderBy,
  type NoteListQueryParams,
} from "./noteListQuery";

export const getPaginatedNotesQuery = async (
  db: DB,
  params: NoteListQueryParams
) => {
  const where = buildNoteListWhere(params.filters);
  return db
    .select({
      id: NoteTable.id,
      title: NoteTable.title,
      summary: NoteTable.summary,
      rawText: NoteTable.rawText,
      folder_id: NoteTable.folderId,
      folder_label: FolderTable.label,
      createdAt: NoteTable.createdAt,
      updatedAt: NoteTable.updatedAt,
      lastViewedAt: NoteTable.lastViewedAt,
    })
    .from(NoteTable)
    .leftJoin(FolderTable, eq(NoteTable.folderId, FolderTable.id))
    .where(where)
    .orderBy(noteListOrderBy(params.sortField, params.sortDirection))
    .limit(params.limit)
    .offset(params.offset);
};

export const getPaginatedNotesWithCountQuery = async (
  db: DB,
  params: NoteListQueryParams
) => {
  const [rows, totalCount] = await Promise.all([
    getPaginatedNotesQuery(db, params),
    countNotesQuery(db, { filters: params.filters }),
  ]);
  return { rows: rows ?? [], totalCount };
};
