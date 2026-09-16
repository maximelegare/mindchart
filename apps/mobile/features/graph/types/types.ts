export type GraphMode = "category" | "folder";

/** How many folder levels the category graph keeps before merging deeper thoughts. */
export type CategoryFolderMergeDepth = 1 | 2 | 3;

export const DEFAULT_CATEGORY_FOLDER_MERGE_DEPTH: CategoryFolderMergeDepth = 2;

export const parseCategoryFolderMergeDepth = (
  value: unknown
): CategoryFolderMergeDepth => {
  if (value === 1 || value === "1") return 1;
  if (value === 3 || value === "3") return 3;
  return 2;
};

export type NodeDatum = {
  name: string;
  id: string;
  value?: number;
  children?: NodeDatum[];
  folderId?: string;
  folderPath?: string | null;
  folderLabel?: string | null;
  /** Folder pack with no notes/thoughts — kept for navigation, rendered muted. */
  isEmptyFolder?: boolean;
  /**
   * Content leaves are either:
   * - thoughts (`thoughtId` set) — category mode
   * - notes (`id` like `note-…`, `noteId` set, no `thoughtId`) — folder mode
   */
  thoughtId?: string;
  /** On note leaves: thought ids under this note (focus / deep-link resolution). */
  relatedThoughtIds?: string[];
  title?: string | null;
  summary?: string | null;
  noteId?: string;
  categoryId?: string;
  createdAt?: string | null;
  embedding?: Float32Array | null;
};

export type GraphDataCache = Record<GraphMode, NodeDatum> & {
  /** Bumped when leaf shape changes (e.g. folder mode → notes). */
  version?: number;
};

export const parseGraphMode = (
  value: string | string[] | undefined
): GraphMode => {
  if (value === "folder") return "folder";
  return "category";
};
