import { create } from "zustand";
import { OptionsBar } from "../../../types";

export type OptionsBarStore = OptionsBar & {
  handleSortByChange: (sortBy: OptionsBar["sortBy"]) => void;
  handleGroupByChange: (groupBy: OptionsBar["groupBy"]) => void;
  handleDisplayChange: (display: OptionsBar["display"]) => void;
};

export const useOptionsBar = create<OptionsBarStore>((set) => ({
  sortBy: "newest",
  groupBy: "topics",
  display: ["notes"],
  handleSortByChange: (sortBy) => set({ sortBy }),
  handleGroupByChange: (groupBy) => set({ groupBy }),
  handleDisplayChange: (display) => set({ display }),
}));
