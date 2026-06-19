import { useControllers } from "@/api/controllers/useControllers";
import { useContentListSort } from "@/features/contentList/hooks/useContentListSort";
import { sortContentList } from "@/features/contentList/utils/sortContentList";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";
import { parseCategoriesWithThoughts } from "../utils/parseCategoriesWithThoughts";

export const useGroupByCategoriesThoughtsData = () => {
  const sortBy = useContentListSort();
  const { useFetchAllThoughtsGroupByCategoryQuery } =
    useControllers().categories;
  const { data, refetch } = useFetchAllThoughtsGroupByCategoryQuery();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return useMemo(() => {
    const categories = parseCategoriesWithThoughts(data);
    if (!categories) return null;

    return sortContentList(categories, sortBy, {
      getName: (category) => category.name,
      getDate: (category) => category.createdAt,
    });
  }, [data, sortBy]);
};
