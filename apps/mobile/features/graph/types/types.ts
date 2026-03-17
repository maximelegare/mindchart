export type NodeDatum = {
  name: string;
  id: string;
  value?: number;
  children?: NodeDatum[];
  // Thought fields (optional, only present on leaf nodes)
  thoughtId?: string;
  title?: string | null;
  summary?: string | null;
  noteId?: string;
  categoryId?: string;
  createdAt?: string | null;
  embedding?: Float32Array | null;
};
