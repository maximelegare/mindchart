import { create } from "zustand";

type TabChromeStore = {
  /** When true, hide the tab bar and floating create button. */
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
};

export const useTabChromeStore = create<TabChromeStore>((set) => ({
  hidden: false,
  setHidden: (hidden) => set({ hidden }),
}));
