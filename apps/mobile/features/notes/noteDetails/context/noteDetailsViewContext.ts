import { mmkv } from "@/context/bridge/zustand_mmkv";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type NoteDetailsViewStore = {
  simplified: boolean;
  setSimplified: (simplified: boolean) => void;
  toggleSimplified: () => void;
  categoryOpacity: number;
  setCategoryOpacity: (opacity: number) => void;
};

function clampCategoryOpacity(opacity: number) {
  if (!Number.isFinite(opacity)) return 1;
  return Math.min(1, Math.max(0, opacity));
}

export const useNoteDetailsViewStore = create<NoteDetailsViewStore>()(
  persist(
    (set) => ({
      simplified: false,
      setSimplified: (simplified) => set({ simplified }),
      toggleSimplified: () =>
        set((state) => ({ simplified: !state.simplified })),
      categoryOpacity: 1,
      setCategoryOpacity: (opacity) =>
        set({ categoryOpacity: clampCategoryOpacity(opacity) }),
    }),
    {
      ...mmkv("note-details-view"),
      partialize: (state) => ({
        simplified: state.simplified,
        categoryOpacity: state.categoryOpacity,
      }),
    }
  )
);
