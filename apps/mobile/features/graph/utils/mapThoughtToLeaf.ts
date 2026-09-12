import { ThoughtWithEmbedding } from "@repo/zod-schemas";
import { NodeDatum } from "../types/types";
import { stripHtml } from "@/components/ui/thoughtsEditor";

export type ThoughtGraphRow = ThoughtWithEmbedding & {
  showTitles?: boolean | number | null;
};

/** Note-level Titles toggle; 0/false hides stored titles without deleting them. */
export const noteShowsThoughtTitles = (value: ThoughtGraphRow["showTitles"]) =>
  value !== false && value !== 0;

export const mapThoughtToLeaf = (t: ThoughtGraphRow): NodeDatum => {
  const title = noteShowsThoughtTitles(t.showTitles) ? stripHtml(t.title) : "";
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
  };
};
