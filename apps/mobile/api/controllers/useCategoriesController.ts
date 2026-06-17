import { useQuery } from "@tanstack/react-query";
import {
  fetchAllCategories,
  fetchAllCategoriesWithThoughtsInfos,
} from "@/api/endpoints/categories";
import { REACT_QUERY_KEYS, ReactQueryOptions } from "@/api/endpoints/KEYS";

export const useCategoriesController = () => {
  const useFetchAllCategoriesQuery = (options?: ReactQueryOptions) =>
    useQuery<Awaited<ReturnType<typeof fetchAllCategories>>>({
      queryKey: [REACT_QUERY_KEYS.fetchAllCategories],
      queryFn: fetchAllCategories,
      ...options,
    });

  const useFetchAllCategoriesWithThoughtsInfosQuery = (
    options?: ReactQueryOptions
  ) =>
    useQuery<Awaited<ReturnType<typeof fetchAllCategoriesWithThoughtsInfos>>>({
      queryKey: [REACT_QUERY_KEYS.fetchAllCategoriesWithThoughtsInfos],
      queryFn: fetchAllCategoriesWithThoughtsInfos,
      ...options,
    });

  return {
    useFetchAllCategoriesQuery,
    useFetchAllCategoriesWithThoughtsInfosQuery,
  };
};
