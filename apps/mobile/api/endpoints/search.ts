import { getOPDatabase, searchThoughtsInFTSQuery } from "@repo/sqlite";

export const searchNotes = async (query: string) => {
  const db = getOPDatabase();
  return await searchThoughtsInFTSQuery(db, query);
};
