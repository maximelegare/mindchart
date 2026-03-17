import { getOPDatabase } from "@repo/sqlite";
import { getAllThoughtsWithEmbeddingsQuery } from "@repo/sqlite";

export const fetchAllThoughtsWithEmbeddings = async () => {
  const db = getOPDatabase();
  return await getAllThoughtsWithEmbeddingsQuery(db);
};
