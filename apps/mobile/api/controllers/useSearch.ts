import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { REACT_QUERY_KEYS, ReactQueryOptions } from "@/api/endpoints/KEYS";
import { searchNotes, type SearchNotesParams } from "../endpoints/search";

export const useSearchController = () => {
  const useSearchNotesQuery = (
    params: SearchNotesParams,
    options?: ReactQueryOptions
  ) =>
    useQuery<Awaited<ReturnType<typeof searchNotes>>>({
      queryKey: [
        REACT_QUERY_KEYS.searchNotes,
        params.query,
        params.includeTranscript ?? false,
        params.limit ?? null,
        params.offset ?? null,
        params.sortField ?? "createdAt",
        params.sortDirection ?? "asc",
        params.filters?.folderId ?? null,
        params.filters?.personIds ?? [],
        params.filters?.feelings ?? [],
        params.filters?.locationIds ?? [],
      ],
      queryFn: () => searchNotes(params),
      enabled: params.query.trim().length > 0,
      placeholderData: keepPreviousData,
      ...options,
    });

  return {
    useSearchNotesQuery,
  };
};
