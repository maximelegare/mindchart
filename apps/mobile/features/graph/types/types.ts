export type GraphMode = "category" | "folder";

export type NodeDatum = {
  name: string;
  id: string;
  value?: number;
  children?: NodeDatum[];
  topicId?: string;
  topicName?: string | null;
  folderId?: string;
  folderPath?: string | null;
  folderLabel?: string | null;
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
  if (value === "folder" || value === "topic") return "folder";
  return "category";
};
