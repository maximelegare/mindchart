import { useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";
import {
  usePaginatedNotes,
  usePaginatedNotesControls,
  usePaginatedNotesPlain,
} from "@/features/contentList/features/pagination/hooks/usePaginatedNotes";
import { useContentListSort } from "@/features/contentList/hooks/useContentListSort";
import {
  latestDate,
  sortContentList,
} from "@/features/contentList/utils/sortContentList";
import { groupNotesByFolder } from "../utils/groupNotesByFolder";

const sortFolderGroups = <
  T extends {
    id: string;
    name: string;
    notes: { createdAt?: string | null }[];
  },
>(
  groups: T[] | null,
  sortBy: ReturnType<typeof useContentListSort>
) => {
  if (!groups?.length) return null;
  return sortContentList(groups, sortBy, {
    getName: (group) => group.name,
    getDate: (group) => latestDate(group.notes.map((note) => note.createdAt)),
  });
};

export const useGroupByFoldersNotesWithOverviewData = () => {
  const sortBy = useContentListSort();
  const { items, refetch } = usePaginatedNotes();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return useMemo(
    () => sortFolderGroups(groupNotesByFolder(items), sortBy),
    [items, sortBy]
  );
};

export const useGroupByFoldersNotesWithoutOverviewData = () => {
  const sortBy = useContentListSort();
  const { items, refetch } = usePaginatedNotesPlain();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return useMemo(
    () => sortFolderGroups(groupNotesByFolder(items), sortBy),
    [items, sortBy]
  );
};

export const useGroupByFoldersNotesPagination = () =>
  usePaginatedNotesControls();
