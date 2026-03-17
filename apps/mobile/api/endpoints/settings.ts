import { exportDatabaseQuery, getOPDatabase } from "@repo/sqlite";

export const exportDatabase = async (data: string) => {
  const db = getOPDatabase();
  await exportDatabaseQuery(db, data);

  return data;
};
