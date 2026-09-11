import { Folder } from "@repo/zod-schemas";
import { FolderTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";
import { getFolderDepth, MAX_FOLDER_DEPTH } from "./folderPath";

export const insertFolderQuery = async (db: DB, data: Folder) => {
  return db.transaction(async (tx) => {
    try {
      if (getFolderDepth(data.path) > MAX_FOLDER_DEPTH) {
        throw new Error(
          `Folders can only be nested ${MAX_FOLDER_DEPTH} levels deep`
        );
      }
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
