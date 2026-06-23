import { useControllers } from "@/api/controllers/useControllers";
import { REACT_QUERY_KEYS } from "@/api/endpoints/KEYS";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";

export const useNoteDetailsData = () => {
  const local = useLocalSearchParams<{ id: string }>();
  const noteId = typeof local.id === "string" ? local.id : local.id?.[0];
  const queryClient = useQueryClient();
  const { useFetchNoteDetails } = useControllers().notesAndThoughts;

  const { data, isPending } = useFetchNoteDetails(noteId ?? "", {
    enabled: !!noteId,
  });

  const note = useMemo(() => parseNoteAndThoughts(data), [data]);

  const noteTitle = useMemo(() => {
    const fromNote = note?.[0]?.title;
    if (fromNote) return fromNote;

    const cachedNotes = queryClient.getQueryData<unknown>([
      REACT_QUERY_KEYS.fetchNotesAndThoughts,
    ]);
    const parsed = parseNoteAndThoughts(cachedNotes);
    return parsed?.find((item) => item.id === noteId)?.title;
  }, [note, queryClient, noteId]);

  return { noteId, noteTitle, isPending, note };
};
