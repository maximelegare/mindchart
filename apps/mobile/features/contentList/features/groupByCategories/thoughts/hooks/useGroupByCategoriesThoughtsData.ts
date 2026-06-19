import { useControllers } from "@/api/controllers/useControllers";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";
import { parseCategoriesWithThoughts } from "../utils/parseCategoriesWithThoughts";

export const useGroupByCategoriesThoughtsData = () => {
  const { useFetchAllThoughtsGroupByCategoryQuery } =
    useControllers().categories;
  const { data, refetch } = useFetchAllThoughtsGroupByCategoryQuery();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return useMemo(() => parseCategoriesWithThoughts(data), [data]);
};
