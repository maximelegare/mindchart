import { eq } from "drizzle-orm";
import { NoteTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

export const updateNoteFolderIdQuery = async (
  db: DB,
  data: { noteId: string; folderId: string | null }
) => {
  return await db
    .update(NoteTable)
    .set({
      folderId: data.folderId,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(NoteTable.id, data.noteId));
};
