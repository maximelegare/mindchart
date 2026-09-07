import { useEffect, useMemo } from "react";
import { useSearchController } from "@/api/controllers/useSearch";
import {
  clampPage,
  paginationOffset,
  paginationPageCount,
} from "@/features/contentList/features/pagination/utils/paginationParams";
import { useSearchContext } from "../context/search";

function normalizeQuery(query: string) {
  return query.trim().toLowerCase();
}

export const useSearch = () => {
  const { query, includeTranscript, page, pageSize, setPage } =
    useSearchContext();
  const { useSearchNotesQuery } = useSearchController();

  const normalizedQuery = useMemo(() => normalizeQuery(query), [query]);
  const shouldSearch = normalizedQuery.length > 0;
  const offset = paginationOffset(page, pageSize);

  const { data, isLoading, isFetching, error } = useSearchNotesQuery(
    {
      query: normalizedQuery,
      includeTranscript,
      limit: pageSize,
      offset,
    },
    {
      enabled: shouldSearch,
    }
  );

  const totalCount = shouldSearch ? (data?.totalCount ?? 0) : 0;
  const pageCount = paginationPageCount(totalCount, pageSize);

  useEffect(() => {
    if (!shouldSearch || data == null) return;
    if (page > pageCount) setPage(clampPage(page, pageCount));
  }, [data, page, pageCount, setPage, shouldSearch]);

  return {
    items: shouldSearch ? (data?.items ?? []) : [],
    totalCount,
    pageCount,
    isLoading: shouldSearch ? isLoading : false,
    isFetching,
    error,
    isEmptyQuery: !shouldSearch,
  };
};
