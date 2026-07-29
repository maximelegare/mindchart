import { mmkv } from "@/context/bridge/zustand_mmkv";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GraphMode, parseGraphMode } from "../types/types";

type GraphStore = {
  mode: GraphMode;
  renderMode: GraphMode;
  selectedFolderId: string | null;
  selectedCategoryId: string | null;
  setGraphMode: (mode: GraphMode) => void;
  setSelectedFolderId: (folderId: string | null) => void;
  setSelectedCategoryId: (categoryId: string | null) => void;
};

let pendingUpdate: ReturnType<typeof setTimeout> | null = null;

export const useGraphStore = create<GraphStore>()(
  persist(
    (set) => ({
      mode: "category",
      renderMode: "category",
      selectedFolderId: null,
      selectedCategoryId: null,
      setGraphMode: (mode) => {
        if (pendingUpdate) clearTimeout(pendingUpdate);
        pendingUpdate = setTimeout(() => {
          set({
            mode,
            renderMode: mode,
            selectedFolderId: null,
            selectedCategoryId: null,
          });
          pendingUpdate = null;
        }, 0);
      },
      setSelectedFolderId: (selectedFolderId) => set({ selectedFolderId }),
      setSelectedCategoryId: (selectedCategoryId) =>
        set({ selectedCategoryId }),
    }),
    {
      ...mmkv("graph"),
      partialize: (state) => ({ mode: state.mode }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<GraphStore> | undefined;
        const mode = parseGraphMode(persisted?.mode);
        return {
          ...currentState,
          ...persisted,
          mode,
          renderMode: mode,
        };
      },
    }
  )
);

/** Immediate store write for navigation/deep links — not used by the toggle. */
export const setGraphModeImmediate = (mode: GraphMode) => {
  if (pendingUpdate) clearTimeout(pendingUpdate);
  useGraphStore.setState({
    mode,
    renderMode: mode,
    selectedFolderId: null,
    selectedCategoryId: null,
  });
};
