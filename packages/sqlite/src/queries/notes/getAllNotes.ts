import { eq } from "drizzle-orm";
import { FolderTable, NoteTable } from "../../schema.root";
import { type DB } from "../../utils/initialize/getOPDatabase";

export const getAllNotesQuery = async (db: DB) => {
  try {
    return await db
      .select({
        id: NoteTable.id,
        title: NoteTable.title,
        summary: NoteTable.summary,
        rawText: NoteTable.rawText,
        folder_id: NoteTable.folderId,
        folder_label: FolderTable.label,
        createdAt: NoteTable.createdAt,
      })
      .from(NoteTable)
      .leftJoin(FolderTable, eq(NoteTable.folderId, FolderTable.id));
  } catch (error) {
    console.error(error);
  }
};
