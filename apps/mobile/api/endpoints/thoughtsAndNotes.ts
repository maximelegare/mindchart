import {
  getNoteByIdWithAssociatedThoughtsQuery,
  getOPDatabase,
} from "@repo/sqlite";
import { getNotesWithAssociatedThoughtsQuery } from "@repo/sqlite";

export const fetchNotesAndThoughts = async () => {
  const db = getOPDatabase();
  return await getNotesWithAssociatedThoughtsQuery(db);
};

export const fetchNoteDetails = async (id: string) => {
  const db = getOPDatabase();
  return await getNoteByIdWithAssociatedThoughtsQuery(db, id);
};
