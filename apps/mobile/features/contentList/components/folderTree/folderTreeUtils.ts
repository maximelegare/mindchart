import { getParentFolderPath, isFolderPathUnder } from "@repo/sqlite";
import { Folder } from "@repo/zod-schemas";

export const FOLDER_TREE_ROOT_ID = "root";

export type FolderSelection = Folder | null;

export type FolderTreeFile = {
  id: string;
  title: string;
  folderId: string | null;
};

export const parentIdOf = (folder: Folder): string | null => {
  const parentPath = getParentFolderPath(folder.path);
  if (!parentPath) return null;
  return parentPath.split("/").filter(Boolean).pop() ?? null;
};

export const isDirectChild = (
  parentPath: string | null,
  folder: Folder
): boolean => {
  if (parentPath === null) {
    return getParentFolderPath(folder.path) === null;
  }
  return getParentFolderPath(folder.path) === parentPath;
};

/** Children keyed by parent folder id (`null` = root). */
export const buildChildrenByParentId = (folders: Folder[]) => {
  const map = new Map<string | null, Folder[]>();
  for (const folder of folders) {
    const parentId = parentIdOf(folder);
    const list = map.get(parentId) ?? [];
    list.push(folder);
    map.set(parentId, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.label.localeCompare(b.label));
  }
  return map;
};

export const filterFoldersExcludingPath = (
  folders: Folder[],
  excludePathPrefix?: string | null
) => {
  if (!excludePathPrefix) return folders;
  return folders.filter(
    (folder) => !isFolderPathUnder(excludePathPrefix, folder.path)
  );
};
