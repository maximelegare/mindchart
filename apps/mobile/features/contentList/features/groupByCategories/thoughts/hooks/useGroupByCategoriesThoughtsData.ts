import { useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";
import { useControllers } from "@/api/controllers/useControllers";
import { useSelectedCategoryId } from "@/features/contentList/hooks/useContentListFilter";
import { useContentListSort } from "@/features/contentList/hooks/useContentListSort";
import {
  usePaginatedNotes,
  usePaginatedNotesControls,
} from "@/features/contentList/features/pagination/hooks/usePaginatedNotes";
import { useCategoryGroupsFromPaginatedNotes } from "@/features/contentList/features/pagination/utils/groupThoughtsByCategoryFromNotes";
import { sortContentList } from "@/features/contentList/utils/sortContentList";

export const useGroupByCategoriesThoughtsData = () => {
  const sortBy = useContentListSort();
  const selectedCategoryId = useSelectedCategoryId();
  const { categories } = useControllers();
  const { data: allCategories = [] } = categories.useFetchAllCategoriesQuery();
  const { items, refetch } = usePaginatedNotes({ withThoughts: true });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const categoryGroups = useCategoryGroupsFromPaginatedNotes(
    items,
    allCategories
  );

  return useMemo(() => {
    if (!categoryGroups) return null;

    const filtered = selectedCategoryId
      ? categoryGroups.filter((category) => category.id === selectedCategoryId)
      : categoryGroups;
    if (!filtered.length) return null;

    return sortContentList(filtered, sortBy, {
      getName: (category) => category.name,
      getDate: (category) => category.createdAt,
    });
  }, [categoryGroups, selectedCategoryId, sortBy]);
};

export const useGroupByCategoriesPagination = () => usePaginatedNotesControls();
