import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  fetchAllCategories,
  fetchAllCategoriesWithThoughtsInfos,
} from "@/api/endpoints/categories";
import { REACT_QUERY_KEYS, ReactQueryOptions } from "@/api/endpoints/KEYS";
import { getAllThoughtsGroupByCategory } from "../endpoints/thoughts";

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
      staleTime: 60_000,
      placeholderData: keepPreviousData,
      ...options,
    });

  const useFetchAllThoughtsGroupByCategoryQuery = (
    options?: ReactQueryOptions
  ) =>
    useQuery<Awaited<ReturnType<typeof getAllThoughtsGroupByCategory>>>({
      queryKey: [REACT_QUERY_KEYS.fetchAllThoughtsGroupByCategory],
      queryFn: getAllThoughtsGroupByCategory,
      refetchOnMount: "always",
      structuralSharing: false,
      ...options,
    });

  return {
    useFetchAllCategoriesQuery,
    useFetchAllCategoriesWithThoughtsInfosQuery,
    useFetchAllThoughtsGroupByCategoryQuery,
  };
};
