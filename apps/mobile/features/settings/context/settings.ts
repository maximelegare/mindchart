import { CategoryKey } from "@repo/sqlite";
import { create } from "zustand";
import { AIProvider } from "../features/ai/types/ai";

export type SettingsState = {
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  categoriesColors: Record<CategoryKey, string> | object;
  aiProvider: AIProvider;
  setAiProvider: (aiProvider: AIProvider) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: "system",
  setTheme: (theme: "light" | "dark" | "system") => set({ theme }),
  categoriesColors: {},
  setCategoriesColors: (categoriesColors: Record<string, string>) =>
    set({ categoriesColors }),
  aiProvider: "local",
  setAiProvider: (aiProvider: AIProvider) => set({ aiProvider }),
}));
