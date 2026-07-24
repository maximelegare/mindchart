import { Folder } from "../../../../zod-schemas/src/schemas";
import { FolderTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

export const insertFolderQuery = async (db: DB, data: Folder) => {
  return db.transaction(async (tx) => {
    try {
      return await tx.insert(FolderTable).values({
        id: data.id,
        path: data.path,
        label: data.label,
        createdAt: data.createdAt ?? new Date().toISOString(),
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
};
