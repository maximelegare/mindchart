import {
  getNoteByIdWithAssociatedThoughtsQuery,
  getNotesByTopicWithAssociatedThoughtsQuery,
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

export const fetchNotesByTopicWithAssociatedThoughts = async (
  topicId: string
) => {
  const db = getOPDatabase();
  return await getNotesByTopicWithAssociatedThoughtsQuery(db, topicId);
};
