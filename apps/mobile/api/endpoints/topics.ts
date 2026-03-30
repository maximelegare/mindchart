import {
  getAllTopicsQuery,
  getOPDatabase,
  insertNewTopicQuery,
} from "@repo/sqlite";
import { Topic } from "@repo/zod-schemas";

export const getAllTopics = async () => {
  const db = getOPDatabase();
  return await getAllTopicsQuery(db);
};

export const insertNewTopic = async (data: Topic) => {
  const db = getOPDatabase();
  console.log("embedding", data.embedding);
  return await insertNewTopicQuery(db, data);
};
