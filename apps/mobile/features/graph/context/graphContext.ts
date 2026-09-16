import { mmkv } from "@/context/bridge/zustand_mmkv";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_CATEGORY_FOLDER_MERGE_DEPTH,
  parseCategoryFolderMergeDepth,
  parseGraphMode,
  type CategoryFolderMergeDepth,
  type GraphMode,
  type NodeDatum,
} from "../types/types";

type GraphStore = {
  mode: GraphMode;
  renderMode: GraphMode;
  selectedFolderId: string | null;
  selectedCategoryId: string | null;
  /** Category graph: 1 = root folders only; 2 = root + children; 3 = full tree. */
  categoryFolderMergeDepth: CategoryFolderMergeDepth;
  /** Live hierarchy root for the options-header breadcrumbs (not persisted). */
  breadcrumbHierarchy: NodeDatum | null;
  breadcrumbActiveId: string | null;
  setGraphMode: (mode: GraphMode) => void;
  setSelectedFolderId: (folderId: string | null) => void;
  setSelectedCategoryId: (categoryId: string | null) => void;
  setCategoryFolderMergeDepth: (depth: CategoryFolderMergeDepth) => void;
  setBreadcrumbNav: (
    hierarchy: NodeDatum | null,
    activeId: string | null
  ) => void;
  /** Imperative zoom from infos/breadcrumbs — not persisted. */
  focusGraphNode: ((nodeId: string) => void) | null;
  setFocusGraphNode: (
    focusGraphNode: ((nodeId: string) => void) | null
  ) => void;
};

let pendingUpdate: ReturnType<typeof setTimeout> | null = null;

export const useGraphStore = create<GraphStore>()(
  persist(
    (set) => ({
      mode: "category",
      renderMode: "category",
      selectedFolderId: null,
      selectedCategoryId: null,
      categoryFolderMergeDepth: DEFAULT_CATEGORY_FOLDER_MERGE_DEPTH,
      breadcrumbHierarchy: null,
      breadcrumbActiveId: null,
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
      setCategoryFolderMergeDepth: (categoryFolderMergeDepth) =>
        set({ categoryFolderMergeDepth }),
      setBreadcrumbNav: (breadcrumbHierarchy, breadcrumbActiveId) =>
        set({ breadcrumbHierarchy, breadcrumbActiveId }),
      focusGraphNode: null,
      setFocusGraphNode: (focusGraphNode) => set({ focusGraphNode }),
    }),
    {
      ...mmkv("graph"),
      partialize: (state) => ({
        mode: state.mode,
        categoryFolderMergeDepth: state.categoryFolderMergeDepth,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<GraphStore> | undefined;
        const mode = parseGraphMode(persisted?.mode);
        const categoryFolderMergeDepth = parseCategoryFolderMergeDepth(
          persisted?.categoryFolderMergeDepth
        );
        return {
          ...currentState,
          ...persisted,
          mode,
          renderMode: mode,
          categoryFolderMergeDepth,
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
