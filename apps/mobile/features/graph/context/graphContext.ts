import { mmkv } from "@/context/bridge/zustand_mmkv";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GraphMode, parseGraphMode } from "../types/types";

type GraphStore = {
  mode: GraphMode;
  renderMode: GraphMode;
  setGraphMode: (mode: GraphMode) => void;
};

let pendingUpdate: ReturnType<typeof setTimeout> | null = null;

export const useGraphStore = create<GraphStore>()(
  persist(
    (set) => ({
      mode: "category",
      renderMode: "category",
      setGraphMode: (mode) => {
        if (pendingUpdate) clearTimeout(pendingUpdate);
        pendingUpdate = setTimeout(() => {
          set({ mode, renderMode: mode });
          pendingUpdate = null;
        }, 0);
      },
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
  useGraphStore.setState({ mode, renderMode: mode });
};
