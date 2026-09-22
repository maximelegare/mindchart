import { sql } from "drizzle-orm";
import { DB } from "../../utils/initialize/getOPDatabase";
import {
  ThoughtTable,
  NoteTable,
  FolderTable,
  LocationTable,
  TextContentTable,
  ListItemContentTable,
  CheckboxContentTable,
} from "../../schema.root";
import { eq } from "drizzle-orm";
import { thoughtJsonObjectSql } from "../thoughtContent/thoughtJson";

export const getNotesWithAssociatedThoughtsQuery = async (db: DB) => {
  try {
    return await db
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
            ${thoughtJsonObjectSql}
          ) FILTER (WHERE ${ThoughtTable.id} IS NOT NULL)
        `.as("thoughts_json"),
      })
      .from(NoteTable)
      .leftJoin(ThoughtTable, eq(NoteTable.id, ThoughtTable.noteId))
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
      .leftJoin(FolderTable, eq(NoteTable.folderId, FolderTable.id))
      .leftJoin(LocationTable, eq(NoteTable.locationId, LocationTable.id))
      .groupBy(NoteTable.id);
  } catch (error) {
    console.error("Database fetch error:", error);
    throw error;
  }
};
