import { create } from "zustand";
import type { FeelingValue } from "@repo/zod-schemas/src/schemas";
import { OptionsBar } from "../../../types";
import { DEFAULT_PAGE_SIZE } from "../../../features/pagination/constants";
import type { PageSize } from "../../../features/pagination/types";

export const OPTIONS_BAR_DEFAULTS = {
  sortField: "createdAt",
  sortDirection: "asc",
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
  pageSize: DEFAULT_PAGE_SIZE,
  page: 1,
} as const satisfies OptionsBar;

const resetPage = { page: 1 } as const;

export type OptionsBarStore = OptionsBar & {
  handleSortFieldChange: (sortField: OptionsBar["sortField"]) => void;
  toggleSortDirection: () => void;
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
  setPageSize: (pageSize: PageSize) => void;
  setPage: (page: number) => void;
};

export const useOptionsBar = create<OptionsBarStore>((set) => ({
  ...OPTIONS_BAR_DEFAULTS,
  handleSortFieldChange: (sortField) => set({ sortField, ...resetPage }),
  toggleSortDirection: () =>
    set((state) => ({
      sortDirection: state.sortDirection === "asc" ? "desc" : "asc",
      ...resetPage,
    })),
  handleGroupByChange: (groupBy) =>
    set((state) => ({
      groupBy,
      displayMode: groupBy !== "none" ? "notes" : state.displayMode,
      selectedFolderId:
        groupBy === "categories" ? null : state.selectedFolderId,
      selectedCategoryId:
        groupBy === "categories" ? state.selectedCategoryId : null,
      ...resetPage,
    })),
  handleDisplayModeChange: (displayMode) => set({ displayMode, ...resetPage }),
  handleFoldersModeChange: (foldersMode) =>
    set((state) => ({
      foldersMode,
      currentFolderId: foldersMode === "without" ? null : state.currentFolderId,
      folderTreeSidebarOpen:
        foldersMode === "without" ? false : state.folderTreeSidebarOpen,
      ...resetPage,
    })),
  handleSelectedFolderChange: (selectedFolderId) =>
    set({ selectedFolderId, ...resetPage }),
  handleSelectedCategoryChange: (selectedCategoryId) =>
    set({ selectedCategoryId, ...resetPage }),
  handleCurrentFolderChange: (currentFolderId) => set({ currentFolderId }),
  setFolderTreeSidebarOpen: (folderTreeSidebarOpen) =>
    set({ folderTreeSidebarOpen }),
  toggleFolderTreeSidebar: () =>
    set((state) => ({ folderTreeSidebarOpen: !state.folderTreeSidebarOpen })),
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
  setPageSize: (pageSize) => set({ pageSize, ...resetPage }),
  setPage: (page) => set({ page }),
}));
