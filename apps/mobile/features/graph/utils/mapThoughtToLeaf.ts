import { NodeDatum } from "../types/types";
import { stripHtml } from "@/components/ui/thoughtsEditor";

/** Live thought row used to build the graph (matches the embeddings query). */
export type ThoughtGraphRow = {
  thoughtId: string;
  title: string | null;
  summary: string | null;
  noteId: string;
  categoryId: string;
  folderId?: string | null;
  folderLabel?: string | null;
  folderPath?: string | null;
  createdAt?: string | null;
  embedding: Float32Array | null;
  showTitles?: boolean | number | null;
  isCompletable?: boolean | number | null;
  isCompleted?: boolean | number | null;
};

/** Note-level Titles toggle; 0/false hides stored titles without deleting them. */
export const noteShowsThoughtTitles = (value: ThoughtGraphRow["showTitles"]) =>
  value !== false && value !== 0;

export const mapThoughtToLeaf = (t: ThoughtGraphRow): NodeDatum => {
  const title = noteShowsThoughtTitles(t.showTitles)
    ? stripHtml(t.title ?? "")
    : "";
  const summary = stripHtml(t.summary ?? "");
  return {
    id: t.thoughtId,
    name: title || summary || "Untitled",
    value: 1,
    thoughtId: t.thoughtId,
    title: title || null,
    summary,
    noteId: t.noteId,
    categoryId: t.categoryId,
    folderId: t.folderId ?? undefined,
    folderLabel: t.folderLabel ?? undefined,
    folderPath: t.folderPath ?? undefined,
    createdAt: t.createdAt,
    embedding: t.embedding,
    isCompletable: Boolean(t.isCompletable),
    isCompleted: Boolean(t.isCompleted),
  };
};
