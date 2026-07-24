import { count, eq } from "drizzle-orm";
import { Folder } from "../../../../zod-schemas/src/schemas";
import { FolderTable, NoteTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

export type FolderWithNotesInfos = Folder & { noteCount: number };

export const getAllFoldersWithNotesInfosQuery = async (
  db: DB
): Promise<FolderWithNotesInfos[] | undefined> => {
  try {
    return await db
      .select({
        id: FolderTable.id,
        path: FolderTable.path,
        label: FolderTable.label,
        createdAt: FolderTable.createdAt,
        noteCount: count(NoteTable.id),
      })
      .from(FolderTable)
      .leftJoin(NoteTable, eq(FolderTable.id, NoteTable.folderId))
      .groupBy(FolderTable.id);
  } catch (error) {
    console.error(error);
  }
};
