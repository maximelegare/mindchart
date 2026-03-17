import { useQuery } from "@tanstack/react-query";
import { fetchAllCategories } from "@/api/endpoints/categories";
import { REACT_QUERY_KEYS, ReactQueryOptions } from "@/api/endpoints/KEYS";

export const useCategoriesController = () => {
  const useFetchAllCategoriesQuery = (options?: ReactQueryOptions) =>
    useQuery<Awaited<ReturnType<typeof fetchAllCategories>>>({
      queryKey: [REACT_QUERY_KEYS.fetchAllCategories],
      queryFn: fetchAllCategories,
      ...options,
    });

  return {
    useFetchAllCategoriesQuery,
  };
};
