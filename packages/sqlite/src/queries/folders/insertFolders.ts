import { Folder } from "../../../../zod-schemas/src/schemas";
import { FolderTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

export const insertFoldersQuery = async (db: DB, data: Folder[]) => {
  return db.transaction(async (tx) => {
    try {
      await Promise.all(
        data.map(({ id, path, label, createdAt }) =>
          tx.insert(FolderTable).values({
            id,
            path,
            label,
            createdAt: createdAt ?? new Date().toISOString(),
          })
        )
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
};
