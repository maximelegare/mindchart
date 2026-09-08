import { useEffect, useMemo } from "react";
import { useSearchController } from "@/api/controllers/useSearch";
import { buildNoteListFilters } from "@/features/contentList/features/pagination/utils/buildNoteListFilters";
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
  const {
    query,
    includeTranscript,
    page,
    pageSize,
    setPage,
    sortField,
    sortDirection,
    selectedFolderId,
    filterPersonIds,
    filterFeelings,
    filterLocationIds,
  } = useSearchContext();
  const { useSearchNotesQuery } = useSearchController();

  const normalizedQuery = useMemo(() => normalizeQuery(query), [query]);
  const shouldSearch = normalizedQuery.length > 0;
  const offset = paginationOffset(page, pageSize);
  const filters = useMemo(
    () =>
      buildNoteListFilters({
        selectedFolderId,
        selectedCategoryId: null,
        groupBy: "none",
        personIds: filterPersonIds,
        feelings: filterFeelings,
        locationIds: filterLocationIds,
      }),
    [selectedFolderId, filterPersonIds, filterFeelings, filterLocationIds]
  );

  const { data, isLoading, isFetching, error } = useSearchNotesQuery(
    {
      query: normalizedQuery,
      includeTranscript,
      limit: pageSize,
      offset,
      sortField,
      sortDirection,
      filters,
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
