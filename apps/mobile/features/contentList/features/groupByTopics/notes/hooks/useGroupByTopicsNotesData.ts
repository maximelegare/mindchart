import { useControllers } from "@/api/controllers/useControllers";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";
import { useContentListSort } from "@/features/contentList/hooks/useContentListSort";
import {
  latestDate,
  sortContentList,
} from "@/features/contentList/utils/sortContentList";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";
import { groupNotesByTopic } from "../utils/groupNotesByTopic";
import { normalizeNotesFromQuery } from "../utils/normalizeNotesFromQuery";

const sortTopicGroups = <
  T extends { name: string; notes: { createdAt?: string | null }[] },
>(
  groups: T[] | null,
  sortBy: ReturnType<typeof useContentListSort>
) => {
  if (!groups) return null;
  return sortContentList(groups, sortBy, {
    getName: (group) => group.name,
    getDate: (group) => latestDate(group.notes.map((note) => note.createdAt)),
  });
};

export const useGroupByTopicsNotesWithOverviewData = () => {
  const sortBy = useContentListSort();
  const { useFetchNotesAndThoughtsQuery } = useControllers().notesAndThoughts;
  const { data, refetch } = useFetchNotesAndThoughtsQuery();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return useMemo(() => {
    const notes = parseNoteAndThoughts(data);
    return sortTopicGroups(groupNotesByTopic(notes ?? []), sortBy);
  }, [data, sortBy]);
};

export const useGroupByTopicsNotesWithoutOverviewData = () => {
  const sortBy = useContentListSort();
  const { useFetchAllNotesQuery } = useControllers().notesAndThoughts;
  const { data, refetch } = useFetchAllNotesQuery();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return useMemo(() => {
    const notes = normalizeNotesFromQuery(data);
    return sortTopicGroups(groupNotesByTopic(notes ?? []), sortBy);
  }, [data, sortBy]);
};
