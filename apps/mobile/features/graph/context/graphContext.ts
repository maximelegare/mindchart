import { mmkv } from "@/context/bridge/zustand_mmkv";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GraphMode, parseGraphMode } from "../types/types";

type GraphStore = {
  mode: GraphMode;
  setGraphMode: (mode: GraphMode) => void;
};

export const useGraphStore = create<GraphStore>()(
  persist(
    (set) => ({
      mode: "category",
      setGraphMode: (mode) => set({ mode }),
    }),
    {
      ...mmkv("graph"),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<GraphStore> | undefined;
        return {
          ...currentState,
          ...persisted,
          mode: parseGraphMode(persisted?.mode),
        };
      },
    }
  )
);
