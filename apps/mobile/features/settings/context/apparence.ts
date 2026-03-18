import { CategoryKey } from "@repo/sqlite";
import { create } from "zustand";

export type UserApparenceSettingsPreferences = {
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  categoriesColors: Record<CategoryKey, string> | object;
};

export const useApparenceSettingsPreferences =
  create<UserApparenceSettingsPreferences>((set) => ({
    theme: "system",
    setTheme: (theme: "light" | "dark" | "system") => set({ theme }),
    categoriesColors: {},
    setCategoriesColors: (categoriesColors: Record<string, string>) =>
      set({ categoriesColors }),
  }));
