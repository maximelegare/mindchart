import { ThoughtWithEmbedding } from "@repo/zod-schemas/client";
import { NodeDatum } from "../types/types";

export const mapThoughtToLeaf = (t: ThoughtWithEmbedding): NodeDatum => ({
  id: t.thoughtId,
  name: t.title || "Untitled",
  value: 1,
  thoughtId: t.thoughtId,
  title: t.title,
  summary: t.summary,
  noteId: t.noteId,
  categoryId: t.categoryId,
  folderId: t.folderId ?? undefined,
  folderLabel: t.folderLabel ?? undefined,
  folderPath: t.folderPath ?? undefined,
  createdAt: t.createdAt,
  embedding: t.embedding,
});
