import { ThoughtWithEmbedding } from "@repo/zod-schemas/client";
import { NodeDatum } from "../types/types";
import { stripHtml } from "@/components/ui/thoughtsEditor";

export const mapThoughtToLeaf = (t: ThoughtWithEmbedding): NodeDatum => ({
  id: t.thoughtId,
  name: stripHtml(t.title) || "Untitled",
  value: 1,
  thoughtId: t.thoughtId,
  title: stripHtml(t.title),
  summary: stripHtml(t.summary ?? ""),
  noteId: t.noteId,
  categoryId: t.categoryId,
  folderId: t.folderId ?? undefined,
  folderLabel: t.folderLabel ?? undefined,
  folderPath: t.folderPath ?? undefined,
  createdAt: t.createdAt,
  embedding: t.embedding,
});
