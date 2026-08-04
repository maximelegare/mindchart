import { eq } from "drizzle-orm";
import { PersonTable, PersonToNoteTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

export const getPersonsByNoteIdQuery = async (db: DB, noteId: string) => {
  return db
    .select({
      id: PersonTable.id,
      name: PersonTable.name,
      contactId: PersonTable.contactId,
      phone: PersonTable.phone,
      email: PersonTable.email,
      createdAt: PersonTable.createdAt,
    })
    .from(PersonToNoteTable)
    .innerJoin(PersonTable, eq(PersonToNoteTable.personId, PersonTable.id))
    .where(eq(PersonToNoteTable.noteId, noteId));
};
