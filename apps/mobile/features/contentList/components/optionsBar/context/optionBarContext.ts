import { create } from "zustand";
import type { FeelingValue } from "@repo/zod-schemas/src/schemas";
import { OptionsBar } from "../../../types";

export const OPTIONS_BAR_DEFAULTS = {
  sortBy: "newest",
  groupBy: "folders",
  displayMode: "notes",
  foldersMode: "with",
  selectedFolderId: null,
  selectedCategoryId: null,
  currentFolderId: null,
  folderTreeSidebarOpen: false,
  filterPersonIds: [] as string[],
  filterFeelings: [] as FeelingValue[],
  filterLocationIds: [] as string[],
} as const satisfies OptionsBar;

export type OptionsBarStore = OptionsBar & {
  handleSortByChange: (sortBy: OptionsBar["sortBy"]) => void;
  handleGroupByChange: (groupBy: OptionsBar["groupBy"]) => void;
  handleDisplayModeChange: (displayMode: OptionsBar["displayMode"]) => void;
  handleFoldersModeChange: (foldersMode: OptionsBar["foldersMode"]) => void;
  handleSelectedFolderChange: (folderId: string | null) => void;
  handleSelectedCategoryChange: (categoryId: string | null) => void;
  handleCurrentFolderChange: (folderId: string | null) => void;
  setFolderTreeSidebarOpen: (open: boolean) => void;
  toggleFolderTreeSidebar: () => void;
  setFilterPersonIds: (personIds: string[]) => void;
  setFilterFeelings: (feelings: FeelingValue[]) => void;
  setFilterLocationIds: (locationIds: string[]) => void;
  clearAttributeFilters: () => void;
};

export const useOptionsBar = create<OptionsBarStore>((set) => ({
  ...OPTIONS_BAR_DEFAULTS,
  handleSortByChange: (sortBy) => set({ sortBy }),
  handleGroupByChange: (groupBy) =>
    set((state) => ({
      groupBy,
      displayMode: groupBy !== "none" ? "notes" : state.displayMode,
      // Keep only the filter that matches the active chip row.
      selectedFolderId:
        groupBy === "categories" ? null : state.selectedFolderId,
      selectedCategoryId:
        groupBy === "categories" ? state.selectedCategoryId : null,
    })),
  handleDisplayModeChange: (displayMode) => set({ displayMode }),
  handleFoldersModeChange: (foldersMode) =>
    set((state) => ({
      foldersMode,
      // Leave folder navigation when switching back to filter chips.
      currentFolderId: foldersMode === "without" ? null : state.currentFolderId,
      folderTreeSidebarOpen:
        foldersMode === "without" ? false : state.folderTreeSidebarOpen,
    })),
  handleSelectedFolderChange: (selectedFolderId) => set({ selectedFolderId }),
  handleSelectedCategoryChange: (selectedCategoryId) =>
    set({ selectedCategoryId }),
  handleCurrentFolderChange: (currentFolderId) => set({ currentFolderId }),
  setFolderTreeSidebarOpen: (folderTreeSidebarOpen) =>
    set({ folderTreeSidebarOpen }),
  toggleFolderTreeSidebar: () =>
    set((state) => ({ folderTreeSidebarOpen: !state.folderTreeSidebarOpen })),
  setFilterPersonIds: (filterPersonIds) => set({ filterPersonIds }),
  setFilterFeelings: (filterFeelings) => set({ filterFeelings }),
  setFilterLocationIds: (filterLocationIds) => set({ filterLocationIds }),
  clearAttributeFilters: () =>
    set({
      filterPersonIds: [],
      filterFeelings: [],
      filterLocationIds: [],
      selectedFolderId: null,
    }),
}));
