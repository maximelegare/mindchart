export type GraphMode = "category" | "topic";

export type NodeDatum = {
  name: string;
  id: string;
  value?: number;
  children?: NodeDatum[];
  topicId?: string;
  topicName?: string | null;
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
): GraphMode => (value === "topic" ? "topic" : "category");
