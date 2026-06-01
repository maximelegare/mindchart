import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mmkv } from "@/context/bridge/zustand_mmkv";

export type Workspace = {
  id: string;
  name: string;
  icon?: string;
  color?: [string, string];
  dbFileName: string;
  createdAt: number;
};

type WorkspacesState = {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  /**
   * Bumped on every workspace switch / import-overwrite so React subtrees
   * keyed on this value remount and drop any stale Drizzle handles.
   */
  dbEpoch: number;
  setWorkspaces: (
    workspaces: Workspace[] | ((prev: Workspace[]) => Workspace[])
  ) => void;
  addWorkspace: (workspace: Workspace) => void;
  removeWorkspace: (id: string) => void;
  updateWorkspace: (id: string, patch: Partial<Omit<Workspace, "id">>) => void;
  setActiveWorkspaceId: (id: string | null) => void;
  bumpDbEpoch: () => void;
};

export const useWorkspacesStore = create<WorkspacesState>()(
  persist(
    (set) => ({
      workspaces: [],
      activeWorkspaceId: null,
      dbEpoch: 0,
      setWorkspaces: (workspaces) =>
        set((state) => ({
          workspaces:
            typeof workspaces === "function"
              ? workspaces(state.workspaces)
              : workspaces,
        })),
      addWorkspace: (workspace) =>
        set((state) => ({ workspaces: [...state.workspaces, workspace] })),
      removeWorkspace: (id) =>
        set((state) => ({
          workspaces: state.workspaces.filter((w) => w.id !== id),
        })),
      updateWorkspace: (id, patch) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === id ? { ...w, ...patch } : w
          ),
        })),
      setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
      bumpDbEpoch: () => set((state) => ({ dbEpoch: state.dbEpoch + 1 })),
    }),
    {
      ...mmkv("workspaces"),
      partialize: (state) => ({
        workspaces: state.workspaces,
        activeWorkspaceId: state.activeWorkspaceId,
      }),
    }
  )
);
