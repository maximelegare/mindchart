import { create } from "zustand";
import { OptionsBar } from "../../../types";

export type OptionsBarStore = OptionsBar & {
  handleSortByChange: (sortBy: OptionsBar["sortBy"]) => void;
  handleGroupByChange: (groupBy: OptionsBar["groupBy"]) => void;
  handleDisplayModeChange: (displayMode: OptionsBar["displayMode"]) => void;
  handleShowOverviewChange: (showOverview: boolean) => void;
};

export const useOptionsBar = create<OptionsBarStore>((set) => ({
  sortBy: "newest",
  groupBy: "topics",
  displayMode: "notes",
  showOverview: true,
  handleSortByChange: (sortBy) => set({ sortBy }),
  handleGroupByChange: (groupBy) =>
    set((state) => ({
      groupBy,
      displayMode: groupBy !== "none" ? "notes" : state.displayMode,
    })),
  handleDisplayModeChange: (displayMode) => set({ displayMode }),
  handleShowOverviewChange: (showOverview) => set({ showOverview }),
}));
