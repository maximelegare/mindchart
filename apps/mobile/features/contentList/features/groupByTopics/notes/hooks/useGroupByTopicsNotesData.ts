import { useControllers } from "@/api/controllers/useControllers";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";
import { useSelectedTopicId } from "@/features/contentList/hooks/useContentListFilter";
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
  T extends {
    id: string;
    name: string;
    notes: { createdAt?: string | null }[];
  },
>(
  groups: T[] | null,
  sortBy: ReturnType<typeof useContentListSort>,
  selectedTopicId: string | null
) => {
  if (!groups) return null;
  const filtered = selectedTopicId
    ? groups.filter((group) => group.id === selectedTopicId)
    : groups;
  if (!filtered.length) return null;
  return sortContentList(filtered, sortBy, {
    getName: (group) => group.name,
    getDate: (group) => latestDate(group.notes.map((note) => note.createdAt)),
  });
};

export const useGroupByTopicsNotesWithOverviewData = () => {
  const sortBy = useContentListSort();
  const selectedTopicId = useSelectedTopicId();
  const { useFetchNotesAndThoughtsQuery } = useControllers().notesAndThoughts;
  const { data, refetch } = useFetchNotesAndThoughtsQuery();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return useMemo(() => {
    const notes = parseNoteAndThoughts(data);
    return sortTopicGroups(
      groupNotesByTopic(notes ?? []),
      sortBy,
      selectedTopicId
    );
  }, [data, selectedTopicId, sortBy]);
};

export const useGroupByTopicsNotesWithoutOverviewData = () => {
  const sortBy = useContentListSort();
  const selectedTopicId = useSelectedTopicId();
  const { useFetchAllNotesQuery } = useControllers().notesAndThoughts;
  const { data, refetch } = useFetchAllNotesQuery();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return useMemo(() => {
    const notes = normalizeNotesFromQuery(data);
    return sortTopicGroups(
      groupNotesByTopic(notes ?? []),
      sortBy,
      selectedTopicId
    );
  }, [data, selectedTopicId, sortBy]);
};
