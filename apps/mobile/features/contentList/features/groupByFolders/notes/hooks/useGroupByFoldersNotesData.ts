import { useControllers } from "@/api/controllers/useControllers";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";
import {
  useNotesAttributeFilters,
  useSelectedFolderId,
} from "@/features/contentList/hooks/useContentListFilter";
import { useContentListSort } from "@/features/contentList/hooks/useContentListSort";
import { filterNotesByAttributes } from "@/features/contentList/utils/filterNotesByAttributes";
import {
  latestDate,
  sortContentList,
} from "@/features/contentList/utils/sortContentList";
import { normalizeNotesFromQuery } from "@/features/contentList/utils/normalizeNotesFromQuery";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";
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
  const selectedFolderId = useSelectedFolderId();
  const attributeFilters = useNotesAttributeFilters();
  const { useFetchNotesAndThoughtsQuery } = useControllers().notesAndThoughts;
  const { data, refetch } = useFetchNotesAndThoughtsQuery();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return useMemo(() => {
    const notes = parseNoteAndThoughts(data);
    const byFolder = selectedFolderId
      ? (notes ?? []).filter((note) => note.folderId === selectedFolderId)
      : (notes ?? []);
    const filtered = filterNotesByAttributes(byFolder, attributeFilters);
    return sortFolderGroups(groupNotesByFolder(filtered), sortBy);
  }, [attributeFilters, data, selectedFolderId, sortBy]);
};

export const useGroupByFoldersNotesWithoutOverviewData = () => {
  const sortBy = useContentListSort();
  const selectedFolderId = useSelectedFolderId();
  const { useFetchAllNotesQuery } = useControllers().notesAndThoughts;
  const { data, refetch } = useFetchAllNotesQuery();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return useMemo(() => {
    const notes = normalizeNotesFromQuery(data);
    const filtered = selectedFolderId
      ? (notes ?? []).filter((note) => note.folderId === selectedFolderId)
      : (notes ?? []);
    return sortFolderGroups(groupNotesByFolder(filtered), sortBy);
  }, [data, selectedFolderId, sortBy]);
};
