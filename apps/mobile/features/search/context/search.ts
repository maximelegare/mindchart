import { create } from "zustand";

export type SearchQuery = {
  queryInput: string;
  query: string;
  setQueryInput: (query: string) => void;
  setQuery: (query: string) => void;
};

export const useSearchContext = create<SearchQuery>((set) => ({
  queryInput: "",
  query: "",
  setQueryInput: (query: string) => set({ queryInput: query }),
  setQuery: (query: string) => set({ query }),
}));
