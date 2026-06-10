import { TopicTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { eq } from "drizzle-orm";

export const updateTopicByIdQuery = async (
  db: DB,
  data: { id: string; name: string; embedding: Float32Array }
) => {
  return await db
    .update(TopicTable)
    .set({
      name: data.name,
      embedding: data.embedding,
    })
    .where(eq(TopicTable.id, data.id));
};
