import { TopicTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { Topic } from "../../../../zod-schemas/src/schemas";

export const getAllTopicsQuery = async (
  db: DB
): Promise<Topic[] | undefined> => {
  try {
    return await db
      .select({
        id: TopicTable.id,
        name: TopicTable.name,
        embedding: TopicTable.embedding,
        createdAt: TopicTable.createdAt,
      })
      .from(TopicTable);
  } catch (error) {
    console.error(error);
  }
};
