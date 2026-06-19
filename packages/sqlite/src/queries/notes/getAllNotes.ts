import { eq } from "drizzle-orm";
import { NoteTable, TopicTable } from "../../schema.root";
import { type DB } from "../../utils/initialize/getOPDatabase";

export const getAllNotesQuery = async (db: DB) => {
  try {
    return await db
      .select({
        id: NoteTable.id,
        title: NoteTable.title,
        summary: NoteTable.summary,
        rawText: NoteTable.rawText,
        topic_id: NoteTable.topicId,
        topic_name: TopicTable.name,
        createdAt: NoteTable.createdAt,
      })
      .from(NoteTable)
      .leftJoin(TopicTable, eq(NoteTable.topicId, TopicTable.id));
  } catch (error) {
    console.error(error);
  }
};
