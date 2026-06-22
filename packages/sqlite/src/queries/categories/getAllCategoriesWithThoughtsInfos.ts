import {
  CategoryTable,
  NoteTable,
  ThoughtTable,
  TopicTable,
} from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { CategoryWithThoughtsInfos } from "../../../../zod-schemas/src/schemas";
import { count, eq } from "drizzle-orm";

export const getAllCategoriesWithThoughtsInfosQuery = async (
  db: DB
): Promise<CategoryWithThoughtsInfos[] | undefined> => {
  try {
    return await db
      .select({
        id: CategoryTable.id,
        name: CategoryTable.name,
        createdAt: CategoryTable.createdAt,
        thoughtCount: count(ThoughtTable.id),
        topicsCount: count(TopicTable.id),
      })
      .from(CategoryTable)
      .leftJoin(ThoughtTable, eq(CategoryTable.id, ThoughtTable.categoryId))
      .leftJoin(NoteTable, eq(ThoughtTable.noteId, NoteTable.id))
      .leftJoin(TopicTable, eq(NoteTable.topicId, TopicTable.id))
      .groupBy(CategoryTable.id);
  } catch (error) {
    console.error(error);
  }
};
