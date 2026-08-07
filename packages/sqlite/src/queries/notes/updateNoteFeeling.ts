import { eq } from "drizzle-orm";
import { NoteTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import type { FeelingValue } from "../../data/settings";

export const updateNoteFeelingQuery = async (
  db: DB,
  data: { noteId: string; feeling: FeelingValue | null }
) => {
  return await db
    .update(NoteTable)
    .set({ feeling: data.feeling })
    .where(eq(NoteTable.id, data.noteId));
};
