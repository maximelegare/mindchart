import { NodeDatum } from "../types/types";
import { stripHtml } from "@/components/ui/thoughtsEditor";
import { isDisplayableSemanticLabel } from "@/lib/nlp/labelQuality";

/** Live thought row used to build the graph (matches the embeddings query). */
export type ThoughtGraphRow = {
  thoughtId: string;
  title: string | null;
  summary: string | null;
  semanticLabel?: string | null;
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
  const summary = stripHtml(t.summary ?? "");
  const userTitle = stripHtml(t.title ?? "");
  const semanticLabel = stripHtml(t.semanticLabel ?? "");
  const enteredTitle =
    userTitle && userTitle.toLowerCase() !== summary.toLowerCase()
      ? userTitle
      : "";
  const compactLabel = isDisplayableSemanticLabel(semanticLabel, summary)
    ? semanticLabel
    : "";
  const heading = enteredTitle || compactLabel;
  return {
    id: t.thoughtId,
    name: heading || summary || "Untitled",
    value: 1,
    thoughtId: t.thoughtId,
    title: heading || null,
    semanticLabel: compactLabel || null,
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
