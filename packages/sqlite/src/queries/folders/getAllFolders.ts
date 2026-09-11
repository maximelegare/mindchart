import { Folder } from "@repo/zod-schemas";
import { FolderTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

export const getAllFoldersQuery = async (
  db: DB
): Promise<Folder[] | undefined> => {
  try {
    return await db
      .select({
        id: FolderTable.id,
        path: FolderTable.path,
        label: FolderTable.label,
        createdAt: FolderTable.createdAt,
      })
      .from(FolderTable);
  } catch (error) {
    console.error(error);
  }
};
