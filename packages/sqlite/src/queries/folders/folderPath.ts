/** Max nested folders under root: `/a`, `/a/b`, `/a/b/c` (3). */
export const MAX_FOLDER_DEPTH = 3;

/** Root-level path for a folder id: `/{id}` */
export const buildRootFolderPath = (id: string) => `/${id}`;

/** Nested path under a parent path: `{parentPath}/{id}` */
export const buildChildFolderPath = (parentPath: string, id: string) =>
  `${parentPath}/${id}`;

/** Parent path of a folder path, or `null` if root-level (`/{id}`). */
export const getParentFolderPath = (path: string): string | null => {
  const segments = path.split("/").filter(Boolean);
  if (segments.length <= 1) return null;
  return `/${segments.slice(0, -1).join("/")}`;
};

/** Folder ids from a materialized path, e.g. `/a/b` → `["a", "b"]`. */
export const getFolderIdsFromPath = (path: string): string[] =>
  path.split("/").filter(Boolean);

/** Nesting depth of a folder path (`/a` → 1, `/a/b/c` → 3). */
export const getFolderDepth = (path: string): number =>
  getFolderIdsFromPath(path).length;

/** True when a child folder can be created under `parentPath` (null = root). */
export const canCreateChildFolder = (parentPath: string | null): boolean =>
  (parentPath ? getFolderDepth(parentPath) : 0) < MAX_FOLDER_DEPTH;

/** True when `candidate` is `path` or a descendant of `path`. */
export const isFolderPathUnder = (path: string, candidate: string): boolean =>
  candidate === path || candidate.startsWith(`${path}/`);

/**
 * Extra depth of the deepest descendant below `folderPath`
 * (0 when the folder has no nested children).
 */
export const getSubtreeExtraDepth = (
  folderPath: string,
  allPaths: string[]
): number => {
  const base = getFolderDepth(folderPath);
  let maxExtra = 0;
  for (const path of allPaths) {
    if (path === folderPath || !isFolderPathUnder(folderPath, path)) continue;
    const extra = getFolderDepth(path) - base;
    if (extra > maxExtra) maxExtra = extra;
  }
  return maxExtra;
};

/** True when moving `folderPath` under `newParentPath` stays within max depth. */
export const canMoveFolderTo = (
  folderPath: string,
  newParentPath: string | null,
  allPaths: string[]
): boolean => {
  const newDepth = (newParentPath ? getFolderDepth(newParentPath) : 0) + 1;
  return (
    newDepth + getSubtreeExtraDepth(folderPath, allPaths) <= MAX_FOLDER_DEPTH
  );
};
