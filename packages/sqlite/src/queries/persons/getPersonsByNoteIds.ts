import { inArray, eq } from "drizzle-orm";
import { PersonTable, PersonToNoteTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

export const getPersonsByNoteIdsQuery = async (db: DB, noteIds: string[]) => {
  if (noteIds.length === 0) return [];

  return db
    .select({
      noteId: PersonToNoteTable.noteId,
      id: PersonTable.id,
      name: PersonTable.name,
      contactId: PersonTable.contactId,
      createdAt: PersonTable.createdAt,
    })
    .from(PersonToNoteTable)
    .innerJoin(PersonTable, eq(PersonToNoteTable.personId, PersonTable.id))
    .where(inArray(PersonToNoteTable.noteId, noteIds));
};
