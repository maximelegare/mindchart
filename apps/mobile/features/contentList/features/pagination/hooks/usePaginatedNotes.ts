import { useEffect, useMemo } from "react";
import type { NoteListQueryParams } from "@repo/sqlite";
import type { Note } from "@repo/zod-schemas";
import type { NotesJoinThoughtsParsedJSONPageSchemaModel } from "@repo/zod-schemas/client";
import { useControllers } from "@/api/controllers/useControllers";
import { useOptionsBar } from "@/features/contentList/components/optionsBar/context/optionBarContext";
import {
  useNotesAttributeFilters,
  useSelectedCategoryId,
  useSelectedFolderId,
} from "@/features/contentList/hooks/useContentListFilter";
import { useContentListSort } from "@/features/contentList/hooks/useContentListSort";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";
import { normalizeNotesFromQuery } from "@/features/contentList/utils/normalizeNotesFromQuery";
import {
  clampPage,
  paginationOffset,
  paginationPageCount,
} from "../utils/paginationParams";
import { buildNoteListFilters } from "../utils/buildNoteListFilters";
import type { PaginatedResult, PageSize } from "../types";

type PaginatedNotesHookResult<T> = PaginatedResult<T> & {
  setPage: (page: number) => void;
  isFetching: boolean;
  refetch: () => void;
};

const usePaginatedNotesQueryParams = () => {
  const sort = useContentListSort();
  const selectedFolderId = useSelectedFolderId();
  const selectedCategoryId = useSelectedCategoryId();
  const attributeFilters = useNotesAttributeFilters();
  const groupBy = useOptionsBar((state) => state.groupBy);
  const page = useOptionsBar((state) => state.page);
  const pageSize = useOptionsBar((state) => state.pageSize);
  const setPage = useOptionsBar((state) => state.setPage);

  const queryParams = useMemo((): NoteListQueryParams => {
    const filters = buildNoteListFilters({
      selectedFolderId,
      selectedCategoryId,
      groupBy,
      ...attributeFilters,
    });
    const hasFilters = Object.keys(filters).length > 0;
    return {
      limit: pageSize,
      offset: paginationOffset(page, pageSize),
      sortField: sort.field,
      sortDirection: sort.direction,
      filters: hasFilters ? filters : undefined,
    };
  }, [
    attributeFilters,
    groupBy,
    page,
    pageSize,
    selectedCategoryId,
    selectedFolderId,
    sort.direction,
    sort.field,
  ]);

  return { queryParams, page, pageSize, setPage };
};

/** Paginated notes with thoughts + persons (overview lists). */
export const usePaginatedNotes = (
  options: { withThoughts?: true; enabled?: boolean } = {}
): PaginatedNotesHookResult<NotesJoinThoughtsParsedJSONPageSchemaModel> => {
  const { enabled = true } = options;
  const { queryParams, page, pageSize, setPage } =
    usePaginatedNotesQueryParams();
  const { notesAndThoughts } = useControllers();
  const { useFetchPaginatedNotesAndThoughtsQuery } = notesAndThoughts;
  const { data, isFetching, refetch } = useFetchPaginatedNotesAndThoughtsQuery(
    queryParams,
    { enabled }
  );

  const totalCount = data?.totalCount ?? 0;
  const pageCount = paginationPageCount(totalCount, pageSize);

  useEffect(() => {
    if (data == null) return;
    if (page > pageCount) setPage(clampPage(page, pageCount));
  }, [data, page, pageCount, setPage]);

  const items = useMemo(
    () => parseNoteAndThoughts(data?.rows) ?? [],
    [data?.rows]
  );

  return {
    items,
    totalCount,
    page,
    pageSize: pageSize as PageSize,
    pageCount,
    setPage,
    isFetching,
    refetch,
  };
};

/** Paginated notes without thoughts (plain note cards). */
export const usePaginatedNotesPlain = (
  options: { enabled?: boolean } = {}
): PaginatedNotesHookResult<Note> => {
  const { enabled = true } = options;
  const { queryParams, page, pageSize, setPage } =
    usePaginatedNotesQueryParams();
  const { notesAndThoughts } = useControllers();
  const { useFetchPaginatedNotesQuery } = notesAndThoughts;
  const { data, isFetching, refetch } = useFetchPaginatedNotesQuery(
    queryParams,
    { enabled }
  );

  const totalCount = data?.totalCount ?? 0;
  const pageCount = paginationPageCount(totalCount, pageSize);

  useEffect(() => {
    if (data == null) return;
    if (page > pageCount) setPage(clampPage(page, pageCount));
  }, [data, page, pageCount, setPage]);

  const items = useMemo(
    () => normalizeNotesFromQuery(data?.rows) ?? [],
    [data?.rows]
  );

  return {
    items,
    totalCount,
    page,
    pageSize: pageSize as PageSize,
    pageCount,
    setPage,
    isFetching,
    refetch,
  };
};

/** Shared pagination chrome (page / pageCount / setPage) for list views. */
export const usePaginatedNotesControls = (options?: { enabled?: boolean }) => {
  const page = useOptionsBar((state) => state.page);
  const pageSize = useOptionsBar((state) => state.pageSize);
  const setPage = useOptionsBar((state) => state.setPage);
  const { notesAndThoughts } = useControllers();
  const { queryParams } = usePaginatedNotesQueryParams();
  const { data, isFetching } =
    notesAndThoughts.useFetchPaginatedNotesAndThoughtsQuery(queryParams, {
      enabled: options?.enabled ?? true,
    });
  const totalCount = data?.totalCount ?? 0;
  const pageCount = paginationPageCount(totalCount, pageSize);
  return { page, pageCount, setPage, isFetching };
};
