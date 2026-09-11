import { create } from "zustand";
import type { FeelingValue } from "@repo/zod-schemas";
import { OPTIONS_BAR_DEFAULTS } from "@/features/contentList/components/optionsBar/context/optionBarContext";
import { DEFAULT_PAGE_SIZE } from "@/features/contentList/features/pagination/constants";
import type { PageSize } from "@/features/contentList/features/pagination/types";
import type { SortDirection, SortField } from "@/features/contentList/types";

const resetPage = { page: 1 } as const;

export type SearchQuery = {
  queryInput: string;
  query: string;
  includeTranscript: boolean;
  page: number;
  pageSize: PageSize;
  sortField: SortField;
  sortDirection: SortDirection;
  selectedFolderId: string | null;
  filterPersonIds: string[];
  filterFeelings: FeelingValue[];
  filterLocationIds: string[];
  pendingNoteId: string | null;
  setQueryInput: (query: string) => void;
  setQuery: (query: string) => void;
  setIncludeTranscript: (includeTranscript: boolean) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: PageSize) => void;
  setSortField: (sortField: SortField) => void;
  toggleSortDirection: () => void;
  handleSelectedFolderChange: (folderId: string | null) => void;
  setFilterPersonIds: (personIds: string[]) => void;
  setFilterFeelings: (feelings: FeelingValue[]) => void;
  setFilterLocationIds: (locationIds: string[]) => void;
  clearAttributeFilters: () => void;
  requestOpenNote: (id: string) => void;
  consumePendingNoteId: () => string | null;
};

export const useSearchContext = create<SearchQuery>((set, get) => ({
  queryInput: "",
  query: "",
  includeTranscript: false,
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  sortField: OPTIONS_BAR_DEFAULTS.sortField,
  sortDirection: OPTIONS_BAR_DEFAULTS.sortDirection,
  selectedFolderId: null,
  filterPersonIds: [],
  filterFeelings: [],
  filterLocationIds: [],
  pendingNoteId: null,
  setQueryInput: (query) => set({ queryInput: query }),
  setQuery: (query) => set({ query, ...resetPage }),
  setIncludeTranscript: (includeTranscript) =>
    set({ includeTranscript, ...resetPage }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, ...resetPage }),
  setSortField: (sortField) => set({ sortField, ...resetPage }),
  toggleSortDirection: () =>
    set((state) => ({
      sortDirection: state.sortDirection === "asc" ? "desc" : "asc",
      ...resetPage,
    })),
  handleSelectedFolderChange: (selectedFolderId) =>
    set({ selectedFolderId, ...resetPage }),
  setFilterPersonIds: (filterPersonIds) =>
    set({ filterPersonIds, ...resetPage }),
  setFilterFeelings: (filterFeelings) => set({ filterFeelings, ...resetPage }),
  setFilterLocationIds: (filterLocationIds) =>
    set({ filterLocationIds, ...resetPage }),
  clearAttributeFilters: () =>
    set({
      filterPersonIds: [],
      filterFeelings: [],
      filterLocationIds: [],
      selectedFolderId: null,
      ...resetPage,
    }),
  requestOpenNote: (id) => set({ pendingNoteId: id }),
  consumePendingNoteId: () => {
    const id = get().pendingNoteId;
    if (id) set({ pendingNoteId: null });
    return id;
  },
}));
