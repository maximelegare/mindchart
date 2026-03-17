import { sql } from "drizzle-orm";
import { DB } from "../../utils/initialize/getOPDatabase";
import { ThoughtTable, NoteTable } from "../../schema.root";
import { eq } from "drizzle-orm";

export const getNotesWithAssociatedThoughtsQuery = async (db: DB) => {
  try {
    return await db
      .select({
        note_id: NoteTable.id,
        note_title: NoteTable.title,
        note_summary: NoteTable.summary,
        note_created_at: NoteTable.createdAt,
        // We aggregate the thoughts into a JSON array string
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
              'noteId', ${ThoughtTable.noteId}
            )
          ) FILTER (WHERE ${ThoughtTable.id} IS NOT NULL)
        `.as("thoughts_json"),
      })
      .from(NoteTable)
      // Use a Left Join so we get notes even if they have no thoughts
      .leftJoin(ThoughtTable, eq(NoteTable.id, ThoughtTable.noteId))
      // Group by the note ID to collapse the join into one row per note
      .groupBy(NoteTable.id);
  } catch (error) {
    console.error("Database fetch error:", error);
    throw error;
  }
};
