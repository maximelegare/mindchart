import { eq } from "drizzle-orm";
import { NoteTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

export const updateNoteLastViewedAtQuery = async (db: DB, noteId: string) => {
  return await db
    .update(NoteTable)
    .set({ lastViewedAt: new Date().toISOString() })
    .where(eq(NoteTable.id, noteId));
};
