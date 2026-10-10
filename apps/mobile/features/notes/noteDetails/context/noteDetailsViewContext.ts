import { mmkv } from "@/context/bridge/zustand_mmkv";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Slider default. Matches the previous max wash (old 100%). */
export const CATEGORY_OPACITY_DEFAULT = 0.6;

type NoteDetailsViewStore = {
  simplified: boolean;
  setSimplified: (simplified: boolean) => void;
  toggleSimplified: () => void;
  categoryOpacity: number;
  setCategoryOpacity: (opacity: number) => void;
};

function clampCategoryOpacity(opacity: number) {
  if (!Number.isFinite(opacity)) return CATEGORY_OPACITY_DEFAULT;
  return Math.min(1, Math.max(0, opacity));
}

export const useNoteDetailsViewStore = create<NoteDetailsViewStore>()(
  persist(
    (set) => ({
      simplified: false,
      setSimplified: (simplified) => set({ simplified }),
      toggleSimplified: () =>
        set((state) => ({ simplified: !state.simplified })),
      categoryOpacity: CATEGORY_OPACITY_DEFAULT,
      setCategoryOpacity: (opacity) =>
        set({ categoryOpacity: clampCategoryOpacity(opacity) }),
    }),
    {
      ...mmkv("note-details-view"),
      version: 1,
      migrate: (persisted, version) => {
        const state = persisted as Partial<NoteDetailsViewStore>;
        if (version >= 1) return state;
        return {
          ...state,
          categoryOpacity: clampCategoryOpacity(
            (state.categoryOpacity ?? 1) * CATEGORY_OPACITY_DEFAULT
          ),
        };
      },
      partialize: (state) => ({
        simplified: state.simplified,
        categoryOpacity: state.categoryOpacity,
      }),
    }
  )
);
