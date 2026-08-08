import { eq } from "drizzle-orm";
import { NoteTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

export const updateNoteLocationQuery = async (
  db: DB,
  data: { noteId: string; locationId: string | null }
) => {
  return await db
    .update(NoteTable)
    .set({ locationId: data.locationId })
    .where(eq(NoteTable.id, data.noteId));
};
