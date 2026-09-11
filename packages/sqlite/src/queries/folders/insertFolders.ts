import { Folder } from "@repo/zod-schemas";
import { FolderTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

export const insertFoldersQuery = async (db: DB, data: Folder[]) => {
  for (const { id, path, label, createdAt } of data) {
    await db.insert(FolderTable).values({
      id,
      path,
      label,
      createdAt: createdAt ?? new Date().toISOString(),
    });
  }
};
