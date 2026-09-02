import {
  deleteThoughByIdQuery,
  deleteThoughtsByIdsQuery,
  getAllThoughtsGroupByCategoryQuery,
  getOPDatabase,
  updateThoughtCompletionQuery,
} from "@repo/sqlite";
import { getAllThoughtsWithEmbeddingsQuery } from "@repo/sqlite";

export const fetchAllThoughtsWithEmbeddings = async () => {
  const db = getOPDatabase();
  return await getAllThoughtsWithEmbeddingsQuery(db);
};

export const deleteThoughtsByIds = async ({ ids }: { ids: string[] }) => {
  const db = getOPDatabase();
  return await deleteThoughtsByIdsQuery(db, ids);
};

export const deleteThoughById = async (id: string) => {
  const db = getOPDatabase();
  return await deleteThoughByIdQuery(db, id);
};

export const getAllThoughtsGroupByCategory = async () => {
  const db = getOPDatabase();
  return await getAllThoughtsGroupByCategoryQuery(db);
};

export const updateThoughtCompletion = async (data: {
  id: string;
  isCompleted: boolean;
}) => {
  const db = getOPDatabase();
  return await updateThoughtCompletionQuery(db, data);
};
