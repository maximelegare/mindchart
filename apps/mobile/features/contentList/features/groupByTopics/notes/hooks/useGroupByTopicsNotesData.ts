import { useControllers } from "@/api/controllers/useControllers";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";
import { groupNotesByTopic } from "../utils/groupNotesByTopic";
import { normalizeNotesFromQuery } from "../utils/normalizeNotesFromQuery";

export const useGroupByTopicsNotesWithOverviewData = () => {
  const { useFetchNotesAndThoughtsQuery } = useControllers().notesAndThoughts;
  const { data, refetch } = useFetchNotesAndThoughtsQuery();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return useMemo(() => {
    const notes = parseNoteAndThoughts(data);
    return groupNotesByTopic(notes ?? []);
  }, [data]);
};

export const useGroupByTopicsNotesWithoutOverviewData = () => {
  const { useFetchAllNotesQuery } = useControllers().notesAndThoughts;
  const { data, refetch } = useFetchAllNotesQuery();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return useMemo(() => {
    const notes = normalizeNotesFromQuery(data);
    return groupNotesByTopic(notes ?? []);
  }, [data]);
};
