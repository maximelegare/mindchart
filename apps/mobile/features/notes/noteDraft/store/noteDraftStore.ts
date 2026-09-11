import { create } from "zustand";
import {
  Note,
  NotesJoinThoughtsParsedJSONPageSchemaModel,
  Thought,
} from "@repo/zod-schemas";

import { generateID } from "@/utils/genrateID";
import { createEmptyThought } from "@/components/ui/thoughtsEditor";

export type DraftNote = NotesJoinThoughtsParsedJSONPageSchemaModel;

type NoteDraftStore = {
  draft: DraftNote | null;
  setDraft: (draft: DraftNote | null) => void;
  clearDraft: () => void;
};

export const useNoteDraftStore = create<NoteDraftStore>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
}));

export const createBlankDraftNote = (
  folderId: string | null = null
): DraftNote => {
  const noteId = generateID();
  const thought = createEmptyThought(noteId);
  thought.semanticLabel = " ";

  return {
    id: noteId,
    title: "",
    summary: "",
    rawText: "",
    folderId: folderId ?? undefined,
    createdAt: new Date().toISOString(),
    feeling: null,
    locationId: null,
    locationName: null,
    persons: [],
    showTitles: false,
    thoughts: [thought as DraftNote["thoughts"][number]],
  };
};

export const createGeneratedDraftNote = (
  note: Note,
  thoughts: Thought[]
): DraftNote => {
  return {
    id: note.id,
    title: note.title,
    summary: note.summary,
    rawText: note.rawText ?? "",
    folderId: note.folderId ?? undefined,
    folderLabel: note.folderLabel ?? undefined,
    createdAt: note.createdAt ?? new Date().toISOString(),
    feeling: note.feeling ?? null,
    locationId: note.locationId ?? null,
    locationName: note.locationName ?? null,
    persons: note.persons ?? [],
    showTitles:
      note.showTitles ??
      thoughts.some((thought) => Boolean(thought.title?.trim())),
    thoughts: thoughts.map((thought) => ({
      ...thought,
      title: thought.title ?? "",
      summary: thought.summary ?? "",
      semanticLabel: thought.semanticLabel ?? "",
      isCompletable: thought.isCompletable ?? false,
      isCompleted: thought.isCompleted ?? false,
    })),
  };
};
