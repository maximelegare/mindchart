import { getAllCategoriesQuery, getOPDatabase } from "@repo/sqlite";
import { getAllCategoriesWithThoughtsInfosQuery } from "@repo/sqlite";

export const fetchAllCategories = async () => {
  const db = getOPDatabase();
  return await getAllCategoriesQuery(db);
};

export const fetchAllCategoriesWithThoughtsInfos = async () => {
  const db = getOPDatabase();
  return await getAllCategoriesWithThoughtsInfosQuery(db);
};
