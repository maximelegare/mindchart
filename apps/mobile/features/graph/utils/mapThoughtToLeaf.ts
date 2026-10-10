import { NodeDatum } from "../types/types";
import { stripHtml } from "@/components/ui/thoughtsEditor";
import { isDisplayableSemanticLabel } from "@/lib/nlp/labelQuality";
import { getThoughtPlainText, type Thought } from "@repo/zod-schemas";

/** Live thought row used to build the graph (matches the embeddings query). */
export type ThoughtGraphRow = Thought & {
  embedding: Float32Array | null;
  showTitles?: boolean | number | null;
};

/** Note-level Titles toggle; 0/false hides stored titles without deleting them. */
export const noteShowsThoughtTitles = (value: ThoughtGraphRow["showTitles"]) =>
  value !== false && value !== 0;

export const mapThoughtToLeaf = (t: ThoughtGraphRow): NodeDatum => {
  const summary = stripHtml(getThoughtPlainText(t));
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
  const isCheckbox = t.type === "checkbox";
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
    type: t.type,
    checked: isCheckbox ? t.content.checked : false,
  };
};
