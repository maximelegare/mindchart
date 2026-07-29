import { and, like, notLike } from "drizzle-orm";
import { Folder } from "../../../../zod-schemas/src/schemas";
import { FolderTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

/**
 * Direct children of a folder.
 * - `parentPath = null` → root-level folders (`/{id}`, no extra segments)
 * - otherwise → paths like `{parentPath}/{id}` with exactly one more segment
 */
export const getChildFoldersQuery = async (
  db: DB,
  parentPath: string | null
): Promise<Folder[] | undefined> => {
  try {
    if (parentPath === null) {
      // Root: one segment after leading slash → path matches `/[^/]+` only
      return await db
        .select({
          id: FolderTable.id,
          path: FolderTable.path,
          label: FolderTable.label,
          createdAt: FolderTable.createdAt,
        })
        .from(FolderTable)
        .where(
          and(like(FolderTable.path, "/%"), notLike(FolderTable.path, "/%/%"))
        );
    }

    const prefix = `${parentPath}/%`;
    const deeper = `${parentPath}/%/%`;
    return await db
      .select({
        id: FolderTable.id,
        path: FolderTable.path,
        label: FolderTable.label,
        createdAt: FolderTable.createdAt,
      })
      .from(FolderTable)
      .where(
        and(like(FolderTable.path, prefix), notLike(FolderTable.path, deeper))
      );
  } catch (error) {
    console.error(error);
  }
};
