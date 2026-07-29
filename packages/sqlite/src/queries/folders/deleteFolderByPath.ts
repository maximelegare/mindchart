import { or, eq, like } from "drizzle-orm";
import { FolderTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

/** Deletes the folder at `path` and all nested descendants. */
export const deleteFolderByPathQuery = async (db: DB, path: string) => {
  return await db
    .delete(FolderTable)
    .where(or(eq(FolderTable.path, path), like(FolderTable.path, `${path}/%`)));
};
