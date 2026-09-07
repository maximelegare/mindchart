import { create } from "zustand";
import { DEFAULT_PAGE_SIZE } from "@/features/contentList/features/pagination/constants";
import type { PageSize } from "@/features/contentList/features/pagination/types";

export type SearchQuery = {
  queryInput: string;
  query: string;
  includeTranscript: boolean;
  page: number;
  pageSize: PageSize;
  pendingNoteId: string | null;
  setQueryInput: (query: string) => void;
  setQuery: (query: string) => void;
  setIncludeTranscript: (includeTranscript: boolean) => void;
  setPage: (page: number) => void;
  requestOpenNote: (id: string) => void;
  consumePendingNoteId: () => string | null;
};

export const useSearchContext = create<SearchQuery>((set, get) => ({
  queryInput: "",
  query: "",
  includeTranscript: false,
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  pendingNoteId: null,
  setQueryInput: (query) => set({ queryInput: query }),
  setQuery: (query) => set({ query, page: 1 }),
  setIncludeTranscript: (includeTranscript) =>
    set({ includeTranscript, page: 1 }),
  setPage: (page) => set({ page }),
  requestOpenNote: (id) => set({ pendingNoteId: id }),
  consumePendingNoteId: () => {
    const id = get().pendingNoteId;
    if (id) set({ pendingNoteId: null });
    return id;
  },
}));
