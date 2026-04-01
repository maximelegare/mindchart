import { TopicTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { Topic } from "../../../../zod-schemas/src/schemas";

export const insertNewTopicQuery = async (db: DB, data: Topic) => {
  return db.transaction(async (tx) => {
    try {
      return await tx.insert(TopicTable).values({
        id: data.id,
        name: data.name,
        embedding: data.embedding,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
};
