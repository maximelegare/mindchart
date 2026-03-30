import { eq } from "drizzle-orm";
import { NoteTable, ThoughtTable, TopicTable } from "../../schema.root";
import { type DB } from "../../utils/initialize/getOPDatabase";

export const getAllThoughtsQuery = async (db: DB) => {
  try {
    return await db
      .select({
        thoughtId: ThoughtTable.id,
        topicName: TopicTable.name,
        topicId: TopicTable.id,
        noteId: ThoughtTable.noteId,
        title: ThoughtTable.title,
        summary: ThoughtTable.summary,
        createdAt: ThoughtTable.createdAt,
      })
      .from(ThoughtTable)
      .leftJoin(NoteTable, eq(ThoughtTable.noteId, NoteTable.id))
      .leftJoin(TopicTable, eq(NoteTable.topicId, TopicTable.id));
  } catch (error) {
    console.error(error);
  }
};
