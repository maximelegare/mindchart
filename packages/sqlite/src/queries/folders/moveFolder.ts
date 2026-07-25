import { eq, like, or } from "drizzle-orm";
import {
  buildChildFolderPath,
  buildRootFolderPath,
  isFolderPathUnder,
} from "./folderPath";
import { FolderTable } from "../../schema.root";
import { DB } from "../../utils/initialize/getOPDatabase";

/**
 * Moves a folder under `newParentPath` (or to root when null), rewriting
 * the folder path and all descendant paths.
 */
export const moveFolderQuery = async (
  db: DB,
  data: { folderId: string; newParentPath: string | null }
) => {
  return db.transaction(async (tx) => {
    const rows = await tx
      .select({
        id: FolderTable.id,
        path: FolderTable.path,
      })
      .from(FolderTable)
      .where(eq(FolderTable.id, data.folderId))
      .limit(1);

    const folder = rows[0];
    if (!folder) {
      throw new Error(`Folder not found: ${data.folderId}`);
    }

    const oldPath = folder.path;
    const nextPath =
      data.newParentPath == null
        ? buildRootFolderPath(folder.id)
        : buildChildFolderPath(data.newParentPath, folder.id);

    if (nextPath === oldPath) return;

    if (
      data.newParentPath != null &&
      (data.newParentPath === oldPath ||
        isFolderPathUnder(oldPath, data.newParentPath))
    ) {
      throw new Error("Cannot move a folder into itself or a descendant");
    }

    const conflict = await tx
      .select({ id: FolderTable.id })
      .from(FolderTable)
      .where(eq(FolderTable.path, nextPath))
      .limit(1);
    if (conflict[0] && conflict[0].id !== folder.id) {
      throw new Error("A folder already exists at the destination path");
    }

    const subtree = await tx
      .select({
        id: FolderTable.id,
        path: FolderTable.path,
      })
      .from(FolderTable)
      .where(
        or(
          eq(FolderTable.path, oldPath),
          like(FolderTable.path, `${oldPath}/%`)
        )
      );

    // Deepest paths first so unique path constraints stay valid mid-update.
    subtree.sort((a, b) => b.path.length - a.path.length);

    for (const row of subtree) {
      const rewritten = nextPath + row.path.slice(oldPath.length);
      await tx
        .update(FolderTable)
        .set({ path: rewritten })
        .where(eq(FolderTable.id, row.id));
    }
  });
};
