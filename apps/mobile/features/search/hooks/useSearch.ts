import { useMemo } from "react";
import { useSearchController } from "@/api/controllers/useSearch";

function normalizeQuery(query: string) {
  return query.trim().toLowerCase();
}

export const useSearch = (query: string) => {
  const { useSearchNotesQuery } = useSearchController();

  const normalizedQuery = useMemo(() => normalizeQuery(query), [query]);

  const shouldSearch = normalizedQuery.length > 0;

  const {
    data: searchNotes,
    isLoading,
    isFetching,
    error,
  } = useSearchNotesQuery(normalizedQuery, {
    enabled: shouldSearch,
  });

  return {
    searchNotes: shouldSearch ? searchNotes : [],
    isLoading: shouldSearch ? isLoading : false,
    isFetching,
    error,
    isEmptyQuery: !shouldSearch,
  };
};
