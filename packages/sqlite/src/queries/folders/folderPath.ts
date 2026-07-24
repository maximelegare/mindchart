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

/** True when `candidate` is `path` or a descendant of `path`. */
export const isFolderPathUnder = (path: string, candidate: string): boolean =>
  candidate === path || candidate.startsWith(`${path}/`);
