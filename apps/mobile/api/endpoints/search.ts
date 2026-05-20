import { getOPDatabase, searchNotesQuery } from "@repo/sqlite";

export const searchNotes = async (query: string) => {
  const db = getOPDatabase();
  return await searchNotesQuery(db, query);
};
