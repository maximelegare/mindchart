import { create } from "zustand";
import { OptionsBar } from "../../../types";

export const OPTIONS_BAR_DEFAULTS = {
  sortBy: "newest",
  groupBy: "topics",
  displayMode: "notes",
  foldersMode: "without",
  selectedTopicId: null,
  selectedCategoryId: null,
  currentFolderId: null,
} as const satisfies OptionsBar;

export type OptionsBarStore = OptionsBar & {
  handleSortByChange: (sortBy: OptionsBar["sortBy"]) => void;
  handleGroupByChange: (groupBy: OptionsBar["groupBy"]) => void;
  handleDisplayModeChange: (displayMode: OptionsBar["displayMode"]) => void;
  handleFoldersModeChange: (foldersMode: OptionsBar["foldersMode"]) => void;
  handleSelectedTopicChange: (topicId: string | null) => void;
  handleSelectedCategoryChange: (categoryId: string | null) => void;
  handleCurrentFolderChange: (folderId: string | null) => void;
};

export const useOptionsBar = create<OptionsBarStore>((set) => ({
  ...OPTIONS_BAR_DEFAULTS,
  handleSortByChange: (sortBy) => set({ sortBy }),
  handleGroupByChange: (groupBy) =>
    set((state) => ({
      groupBy,
      displayMode: groupBy !== "none" ? "notes" : state.displayMode,
      // Keep only the filter that matches the active chip row.
      selectedTopicId: groupBy === "categories" ? null : state.selectedTopicId,
      selectedCategoryId:
        groupBy === "categories" ? state.selectedCategoryId : null,
    })),
  handleDisplayModeChange: (displayMode) => set({ displayMode }),
  handleFoldersModeChange: (foldersMode) =>
    set((state) => ({
      foldersMode,
      // Leave folder navigation when switching back to filter chips.
      currentFolderId: foldersMode === "without" ? null : state.currentFolderId,
    })),
  handleSelectedTopicChange: (selectedTopicId) => set({ selectedTopicId }),
  handleSelectedCategoryChange: (selectedCategoryId) =>
    set({ selectedCategoryId }),
  handleCurrentFolderChange: (currentFolderId) => set({ currentFolderId }),
}));
