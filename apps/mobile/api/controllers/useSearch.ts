import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { REACT_QUERY_KEYS, ReactQueryOptions } from "@/api/endpoints/KEYS";
import { searchNotes } from "../endpoints/search";

export const useSearchController = () => {
  const useSearchNotesQuery = (query: string, options?: ReactQueryOptions) =>
    useQuery<Awaited<ReturnType<typeof searchNotes>>>({
      queryKey: [REACT_QUERY_KEYS.searchNotes, query],
      queryFn: () => searchNotes(query),
      enabled: query.trim().length > 0,
      placeholderData: keepPreviousData,
      ...options,
    });

  return {
    useSearchNotesQuery,
  };
};
