import { eq, sql } from "drizzle-orm";
import { DB } from "../../utils/initialize/getOPDatabase";
import { ThoughtTable, NoteTable, TopicTable } from "../../schema.root";

type TopicNoteRow = {
  note_id: string;
  note_title: string | null;
  note_summary: string | null;
  note_raw_text: string | null;
  note_created_at: string;
  thoughts_json: string;
};

export const getAllTopicsWithAssociatedNotesAndThoughtsQuery = async (
  db: DB
) => {
  try {
    const rows = await db
      .select({
        topic_id: TopicTable.id,
        topic_name: TopicTable.name,
        topic_created_at: TopicTable.createdAt,
        note_id: NoteTable.id,
        note_title: NoteTable.title,
        note_summary: NoteTable.summary,
        note_raw_text: NoteTable.rawText,
        note_created_at: NoteTable.createdAt,
        thoughts_json: sql<string>`
          json_group_array(
            json_object(
              'id', ${ThoughtTable.id},
              'thoughtId', ${ThoughtTable.id},
              'title', ${ThoughtTable.title},
              'summary', ${ThoughtTable.summary},
              'semanticLabel', ${ThoughtTable.semanticLabel},
              'createdAt', ${ThoughtTable.createdAt},
              'categoryId', ${ThoughtTable.categoryId},
              'noteId', ${ThoughtTable.noteId}
            )
          ) FILTER (WHERE ${ThoughtTable.id} IS NOT NULL)
        `.as("thoughts_json"),
      })
      .from(TopicTable)
      .innerJoin(NoteTable, eq(TopicTable.id, NoteTable.topicId))
      .leftJoin(ThoughtTable, eq(NoteTable.id, ThoughtTable.noteId))
      .groupBy(TopicTable.id, NoteTable.id);

    const topicsById = new Map<
      string,
      {
        topic_id: string;
        topic_name: string;
        topic_created_at: string;
        notes: TopicNoteRow[];
      }
    >();

    for (const row of rows) {
      if (!row.note_id) continue;

      const note: TopicNoteRow = {
        note_id: row.note_id,
        note_title: row.note_title,
        note_summary: row.note_summary,
        note_raw_text: row.note_raw_text,
        note_created_at: row.note_created_at,
        thoughts_json: row.thoughts_json,
      };

      const existing = topicsById.get(row.topic_id);
      if (existing) {
        existing.notes.push(note);
      } else {
        topicsById.set(row.topic_id, {
          topic_id: row.topic_id,
          topic_name: row.topic_name,
          topic_created_at: row.topic_created_at,
          notes: [note],
        });
      }
    }

    return Array.from(topicsById.values()).map((topic) => ({
      topic_id: topic.topic_id,
      topic_name: topic.topic_name,
      topic_created_at: topic.topic_created_at,
      notes_json: JSON.stringify(topic.notes),
    }));
  } catch (error) {
    console.error(error);
  }
};
