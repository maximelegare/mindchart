import { NoteTable, TopicTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { TopicWithNotesInfos } from "../../../../zod-schemas/src/schemas";
import { count, eq } from "drizzle-orm";

export const getAllTopicsWithNotesInfosQuery = async (
  db: DB
): Promise<TopicWithNotesInfos[] | undefined> => {
  try {
    return await db
      .select({
        id: TopicTable.id,
        name: TopicTable.name,
        embedding: TopicTable.embedding,
        createdAt: TopicTable.createdAt,
        noteCount: count(NoteTable.id),
      })
      .from(TopicTable)
      .leftJoin(NoteTable, eq(TopicTable.id, NoteTable.topicId))
      .groupBy(TopicTable.id);
  } catch (error) {
    console.error(error);
  }
};
