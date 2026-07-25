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
  /** True when deeper folder children exist beyond the visible window. */
  hasHiddenChildren?: boolean;
  // Thought fields (optional, only present on leaf nodes)
  thoughtId?: string;
  title?: string | null;
  summary?: string | null;
  noteId?: string;
  categoryId?: string;
  createdAt?: string | null;
  embedding?: Float32Array | null;
};

export type GraphDataCache = Record<GraphMode, NodeDatum>;

export const parseGraphMode = (
  value: string | string[] | undefined
): GraphMode => {
  if (value === "folder" || value === "topic") return "folder";
  return "category";
};
