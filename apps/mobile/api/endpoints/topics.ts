import {
  deleteTopicByIdQuery,
  getAllTopicsQuery,
  getAllTopicsWithNotesInfosQuery,
  getOPDatabase,
  insertNewTopicQuery,
  updateTopicByIdQuery,
} from "@repo/sqlite";
import { Topic } from "@repo/zod-schemas";

export const getAllTopics = async () => {
  const db = getOPDatabase();
  return await getAllTopicsQuery(db);
};

export const getAllTopicsWithNotesInfos = async () => {
  const db = getOPDatabase();
  return await getAllTopicsWithNotesInfosQuery(db);
};

export const insertNewTopic = async (data: Topic) => {
  const db = getOPDatabase();
  console.log("embedding", data.embedding);
  return await insertNewTopicQuery(db, data);
};

export const deleteTopicById = async (id: string) => {
  const db = getOPDatabase();
  return await deleteTopicByIdQuery(db, id);
};

export const updateTopicById = async (data: {
  id: string;
  name: string;
  embedding: Float32Array;
}) => {
  const db = getOPDatabase();
  return await updateTopicByIdQuery(db, data);
};
