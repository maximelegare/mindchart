import { getAllCategoriesQuery, getOPDatabase } from "@repo/sqlite";

export const fetchAllCategories = async () => {
  const db = getOPDatabase();
  return await getAllCategoriesQuery(db);
};
