import { eq } from "drizzle-orm";
import { NoteTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

export const deleteNoteByIdQuery = async (db: DB, noteId: string) => {
  return await db.delete(NoteTable).where(eq(NoteTable.id, noteId));
};
