import { eq } from "drizzle-orm";
import { FolderTable, NoteTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

export const getFolderContentsQuery = async (
  db: DB,
  folderId: string
): Promise<
  | {
      id: string;
      title: string | null;
      summary: string | null;
      rawText: string | null;
      folder_id: string | null;
      folder_label: string | null;
      createdAt: string;
    }[]
  | undefined
> => {
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
      .leftJoin(FolderTable, eq(NoteTable.folderId, FolderTable.id))
      .where(eq(NoteTable.folderId, folderId));
  } catch (error) {
    console.error(error);
  }
};
