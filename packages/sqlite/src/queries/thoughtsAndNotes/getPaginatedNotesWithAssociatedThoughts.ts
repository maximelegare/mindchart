import { eq, inArray, sql } from "drizzle-orm";
import { DB } from "../../utils/initialize/getOPDatabase";
import {
  ThoughtTable,
  NoteTable,
  FolderTable,
  LocationTable,
} from "../../schema.root";
import {
  buildNoteListWhere,
  countNotesQuery,
  noteListOrderBy,
  type NoteListQueryParams,
} from "../notes/noteListQuery";

export const getPaginatedNotesWithAssociatedThoughtsQuery = async (
  db: DB,
  params: NoteListQueryParams
) => {
  const where = buildNoteListWhere(params.filters);

  const idRows = await db
    .select({ id: NoteTable.id })
    .from(NoteTable)
    .where(where)
    .orderBy(noteListOrderBy(params.sortField, params.sortDirection))
    .limit(params.limit)
    .offset(params.offset);

  const noteIds = idRows.map((row) => row.id);
  if (!noteIds.length) return [];

  const rows = await db
    .select({
      note_id: NoteTable.id,
      note_title: NoteTable.title,
      note_summary: NoteTable.summary,
      note_raw_text: NoteTable.rawText,
      note_created_at: NoteTable.createdAt,
      note_updated_at: NoteTable.updatedAt,
      note_last_viewed_at: NoteTable.lastViewedAt,
      note_show_titles: NoteTable.showTitles,
      note_feeling: NoteTable.feeling,
      location_id: NoteTable.locationId,
      location_name: LocationTable.name,
      folder_id: NoteTable.folderId,
      folder_label: FolderTable.label,
      thoughts_json: sql<string>`
        json_group_array(
          json_object(
            'id', ${ThoughtTable.id},
            'thoughtId', ${ThoughtTable.id},
            'title', ${ThoughtTable.title},
            'summary', ${ThoughtTable.summary},
            'createdAt', ${ThoughtTable.createdAt},
            'semanticLabel', ${ThoughtTable.semanticLabel},
            'categoryId', ${ThoughtTable.categoryId},
            'noteId', ${ThoughtTable.noteId},
            'isCompletable', ${ThoughtTable.isCompletable},
            'isCompleted', ${ThoughtTable.isCompleted}
          )
        ) FILTER (WHERE ${ThoughtTable.id} IS NOT NULL)
      `.as("thoughts_json"),
    })
    .from(NoteTable)
    .leftJoin(ThoughtTable, eq(NoteTable.id, ThoughtTable.noteId))
    .leftJoin(FolderTable, eq(NoteTable.folderId, FolderTable.id))
    .leftJoin(LocationTable, eq(NoteTable.locationId, LocationTable.id))
    .where(inArray(NoteTable.id, noteIds))
    .groupBy(NoteTable.id)
    .orderBy(noteListOrderBy(params.sortField, params.sortDirection));

  return rows ?? [];
};

export const getPaginatedNotesWithThoughtsAndCountQuery = async (
  db: DB,
  params: NoteListQueryParams
) => {
  const [rows, totalCount] = await Promise.all([
    getPaginatedNotesWithAssociatedThoughtsQuery(db, params),
    countNotesQuery(db, { filters: params.filters }),
  ]);
  return { rows, totalCount };
};
