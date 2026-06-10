import { TopicTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { eq } from "drizzle-orm";

export const deleteTopicByIdQuery = async (db: DB, id: string) => {
  return await db.delete(TopicTable).where(eq(TopicTable.id, id));
};
