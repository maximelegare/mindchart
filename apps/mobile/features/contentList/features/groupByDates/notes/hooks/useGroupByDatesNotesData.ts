import { useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";
import {
  usePaginatedNotes,
  usePaginatedNotesControls,
  usePaginatedNotesPlain,
} from "@/features/contentList/features/pagination/hooks/usePaginatedNotes";
import { useContentListSort } from "@/features/contentList/hooks/useContentListSort";
import { groupNotesByDate } from "../utils/groupNotesByDate";

export const useGroupByDatesNotesWithOverviewData = () => {
  const sortBy = useContentListSort();
  const { items, refetch } = usePaginatedNotes();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return useMemo(
    () => groupNotesByDate(items, sortBy.field, sortBy.direction),
    [items, sortBy.direction, sortBy.field]
  );
};

export const useGroupByDatesNotesWithoutOverviewData = () => {
  const sortBy = useContentListSort();
  const { items, refetch } = usePaginatedNotesPlain();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return useMemo(
    () => groupNotesByDate(items, sortBy.field, sortBy.direction),
    [items, sortBy.direction, sortBy.field]
  );
};

export const useGroupByDatesNotesPagination = () => usePaginatedNotesControls();
