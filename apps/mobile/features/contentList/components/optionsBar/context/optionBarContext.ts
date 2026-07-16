import { create } from "zustand";
import { OptionsBar } from "../../../types";

export type OptionsBarStore = OptionsBar & {
  handleSortByChange: (sortBy: OptionsBar["sortBy"]) => void;
  handleGroupByChange: (groupBy: OptionsBar["groupBy"]) => void;
  handleDisplayModeChange: (displayMode: OptionsBar["displayMode"]) => void;
  handleShowOverviewChange: (showOverview: boolean) => void;
  handleSelectedTopicChange: (topicId: string | null) => void;
  handleSelectedCategoryChange: (categoryId: string | null) => void;
};

export const useOptionsBar = create<OptionsBarStore>((set) => ({
  sortBy: "newest",
  groupBy: "topics",
  displayMode: "notes",
  showOverview: true,
  selectedTopicId: null,
  selectedCategoryId: null,
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
  handleShowOverviewChange: (showOverview) => set({ showOverview }),
  handleSelectedTopicChange: (selectedTopicId) => set({ selectedTopicId }),
  handleSelectedCategoryChange: (selectedCategoryId) =>
    set({ selectedCategoryId }),
}));
