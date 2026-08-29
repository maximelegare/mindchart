import { useControllers } from "@/api/controllers/useControllers";
import { REACT_QUERY_KEYS } from "@/api/endpoints/KEYS";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";
import {
  createBlankDraftNote,
  useNoteDraftStore,
  type DraftNote,
} from "@/features/notes/noteDraft/store/noteDraftStore";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef } from "react";

function resolveDraftNote(
  noteId: string | undefined,
  draft: DraftNote | null,
  fallbackRef: React.MutableRefObject<DraftNote | null>
): DraftNote {
  if (draft && draft.id === noteId) return draft;
  if (!fallbackRef.current || fallbackRef.current.id !== noteId) {
    const fallback = createBlankDraftNote(null);
    fallback.id = noteId ?? fallback.id;
    fallbackRef.current = fallback;
  }
  return fallbackRef.current;
}

export const useNoteDetailsData = (isNewMode: boolean) => {
  const local = useLocalSearchParams<{ id: string }>();
  const noteId = typeof local.id === "string" ? local.id : local.id?.[0];
  const queryClient = useQueryClient();
  const { useFetchNoteDetails, useUpdateNoteLastViewedAtMutation } =
    useControllers().notesAndThoughts;
  const { mutate: updateLastViewedAt } = useUpdateNoteLastViewedAtMutation();
  const draft = useNoteDraftStore((s) => s.draft);
  const fallbackDraftRef = useRef<DraftNote | null>(null);
  const recordedNoteIdRef = useRef<string | null>(null);

  const draftNote = useMemo(
    () => resolveDraftNote(noteId, draft, fallbackDraftRef),
    [draft, noteId]
  );

  const { data, isPending: queryPending } = useFetchNoteDetails(noteId ?? "", {
    enabled: !!noteId && !isNewMode,
  });

  useEffect(() => {
    if (isNewMode || !noteId) return;
    if (data && recordedNoteIdRef.current !== noteId) {
      recordedNoteIdRef.current = noteId;
      updateLastViewedAt(noteId);
    }
  }, [data, isNewMode, noteId, updateLastViewedAt]);

  const note = useMemo(() => {
    if (isNewMode) return [draftNote];
    return parseNoteAndThoughts(data);
  }, [data, draftNote, isNewMode]);

  const noteTitle = useMemo(() => {
    if (isNewMode) return draftNote.title;
    const fromNote = note?.[0]?.title;
    if (fromNote) return fromNote;

    const cachedNotes = queryClient.getQueryData<unknown>([
      REACT_QUERY_KEYS.fetchNotesAndThoughts,
    ]);
    const parsed = parseNoteAndThoughts(cachedNotes);
    return parsed?.find((item) => item.id === noteId)?.title;
  }, [draftNote.title, isNewMode, note, noteId, queryClient]);

  return {
    noteId,
    noteTitle,
    isPending: isNewMode ? false : queryPending,
    note,
  };
};
