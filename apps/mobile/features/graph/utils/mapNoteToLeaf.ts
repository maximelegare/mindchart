import { Note } from "@repo/zod-schemas";
import { NodeDatum } from "../types/types";

/** Stable graph id for note leaves (distinct from `folder-…` packs). */
export const noteNodeId = (noteId: string) => `note-${noteId}`;

export const isNoteLeafId = (id: string) => id.startsWith("note-");

/** Folder-mode leaf: one node per note (no thoughtId). */
export const mapNoteToLeaf = (
  note: Note,
  relatedThoughtIds?: string[]
): NodeDatum => ({
  id: noteNodeId(note.id),
  name: note.title || "Untitled",
  // Size by contained thoughts so a note that groups many thoughts reads larger.
  value: Math.max(1, relatedThoughtIds?.length ?? 1),
  title: note.title || "Untitled",
  summary: note.summary || null,
  noteId: note.id,
  relatedThoughtIds,
  topicId: note.topicId ?? undefined,
  topicName: note.topicName ?? null,
  folderId: note.folderId ?? undefined,
  folderLabel: note.folderLabel ?? undefined,
  createdAt: note.createdAt ?? null,
});
