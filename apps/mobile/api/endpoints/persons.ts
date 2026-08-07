import {
  getAllPersonsQuery,
  getOPDatabase,
  getPersonsByNoteIdQuery,
  insertPersonQuery,
  upsertPersonsFromContactsQuery,
} from "@repo/sqlite";
import { Person } from "@repo/zod-schemas";

export const getAllPersons = async () => {
  const db = getOPDatabase();
  return await getAllPersonsQuery(db);
};

export const getPersonsByNoteId = async (noteId: string) => {
  const db = getOPDatabase();
  return await getPersonsByNoteIdQuery(db, noteId);
};

export const insertPerson = async (data: Person) => {
  const db = getOPDatabase();
  return await insertPersonQuery(db, data);
};

export const upsertPersonsFromContacts = async (contacts: Person[]) => {
  const db = getOPDatabase();
  return await upsertPersonsFromContactsQuery(db, contacts);
};
