import { mmkv } from "@/context/bridge/zustand_mmkv";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type NoteDetailsViewStore = {
  simplified: boolean;
  setSimplified: (simplified: boolean) => void;
  toggleSimplified: () => void;
};

export const useNoteDetailsViewStore = create<NoteDetailsViewStore>()(
  persist(
    (set) => ({
      simplified: true,
      setSimplified: (simplified) => set({ simplified }),
      toggleSimplified: () =>
        set((state) => ({ simplified: !state.simplified })),
    }),
    {
      ...mmkv("note-details-view"),
      partialize: (state) => ({ simplified: state.simplified }),
    }
  )
);
