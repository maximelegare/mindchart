import { useControllers } from "@/api/controllers/useControllers";
import { warmupGraphLayouts } from "../components/graphSkia";
import { buildGraphByFolder } from "../utils/buildGraphByFolder";
import { buildGraphByCategoryFolders } from "../utils/buildGraphByCategoryFolders";
import {
  isGraphDataCache,
  needsFolderGraphRebuild,
  normalizeGraphData,
} from "../utils/parseGraphData";
import { ThoughtWithEmbedding } from "@repo/zod-schemas";
import { useEffect, useRef, useState } from "react";
import { useWorkspacesStore } from "@/features/workspaces/context/workspacesContext";
import { GraphDataCache, NodeDatum } from "../types/types";
import { Folder } from "@repo/zod-schemas/src/schemas";

export type { NodeDatum };

export type NodeType = {
  x: number;
  y: number;
  r: number;
  depth: number;
  name: string;
  children: boolean;
};

/** Signature that changes when folder tree or note placement changes. */
const buildSyncSignature = (
  thoughts: ThoughtWithEmbedding[],
  folders: Folder[]
) => {
  const folderPart = folders
    .map((folder) => `${folder.id}:${folder.path}`)
    .sort()
    .join("|");
  const thoughtPart = thoughts
    .map((thought) => `${thought.thoughtId}:${thought.folderId ?? ""}`)
    .sort()
    .join("|");
  return `${folderPart}::${thoughtPart}`;
};

export const useGraph = () => {
  const { graph, notesAndThoughts, folders } = useControllers();

  const {
    useFetchGraphDataQuery,
    useFetchSyncGraphQuery,
    useUpdateGraphDataMutation,
    useUpdateSyncGraphDataMutation,
  } = graph;

  const { useFetchAllThoughtsWithEmbeddingsQuery } = notesAndThoughts;
  const { useFetchAllFoldersQuery } = folders;

  const { mutateAsync: mutateGraph } = useUpdateGraphDataMutation();
  const { mutateAsync: mutateSyncGraph } = useUpdateSyncGraphDataMutation();

  const { data: syncFlag, refetch: refetchSyncGraph } = useFetchSyncGraphQuery({
    staleTime: 30_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const syncGraph = syncFlag?.data;

  const {
    data: thoughts,
    isFetching: thoughtsIsFetching,
    refetch: refetchThoughts,
  } = useFetchAllThoughtsWithEmbeddingsQuery({
    enabled: !!syncGraph,
    staleTime: 0,
  });

  const {
    data: allFolders,
    isFetching: foldersIsFetching,
    refetch: refetchFolders,
  } = useFetchAllFoldersQuery({
    enabled: !!syncGraph,
    staleTime: 0,
  });

  const graphQuery = useFetchGraphDataQuery({
    enabled: !syncGraph,
  });

  const graphData = graphQuery.data?.data;

  const [hierarchies, setHierarchies] = useState<GraphDataCache | null>(null);
  const [syncInputsReady, setSyncInputsReady] = useState(false);
  const builtForRef = useRef<string | null>(null);

  const activeWorkspaceId = useWorkspacesStore((s) => s.activeWorkspaceId);
  useEffect(() => {
    setHierarchies(null);
    builtForRef.current = null;
    setSyncInputsReady(false);
  }, [activeWorkspaceId]);

  // Refetch inputs whenever sync is requested, then rebuild from fresh data.
  // Counts alone are not enough (e.g. moving a note keeps the same lengths).
  useEffect(() => {
    if (!syncGraph) {
      setSyncInputsReady(false);
      return;
    }

    builtForRef.current = null;
    setSyncInputsReady(false);

    let cancelled = false;
    void Promise.all([refetchThoughts(), refetchFolders()]).then(() => {
      if (!cancelled) setSyncInputsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [syncGraph, refetchThoughts, refetchFolders]);

  const applyCache = (cache: GraphDataCache, cacheKey: string) => {
    builtForRef.current = cacheKey;
    setHierarchies(cache);
    warmupGraphLayouts(cache);
  };

  useEffect(() => {
    if (syncGraph || !graphData) return;

    // Legacy topic-based cache → rebuild with folders.
    if (needsFolderGraphRebuild(graphData)) {
      void mutateSyncGraph(true);
      return;
    }

    if (!isGraphDataCache(graphData)) return;

    const normalized = normalizeGraphData(graphData);
    if (!normalized) return;

    const cacheKey = `cached:${activeWorkspaceId}`;
    if (builtForRef.current === cacheKey) return;

    const id = setTimeout(() => {
      applyCache(normalized, cacheKey);
    }, 0);

    return () => clearTimeout(id);
  }, [syncGraph, graphData, activeWorkspaceId, mutateSyncGraph]);

  useEffect(() => {
    if (
      !syncGraph ||
      !syncInputsReady ||
      thoughtsIsFetching ||
      foldersIsFetching ||
      !thoughts ||
      !allFolders
    )
      return;

    const typedThoughts = thoughts as ThoughtWithEmbedding[];
    const signature = buildSyncSignature(typedThoughts, allFolders);
    const cacheKey = `thoughts:${activeWorkspaceId}:${signature}`;
    if (builtForRef.current === cacheKey) return;

    const id = setTimeout(() => {
      const cache: GraphDataCache = {
        category: buildGraphByCategoryFolders(
          allFolders,
          typedThoughts
        ) as NodeDatum,
        folder: buildGraphByFolder(allFolders, typedThoughts) as NodeDatum,
      };

      applyCache(cache, cacheKey);
      void mutateGraph(cache);
    }, 0);

    return () => clearTimeout(id);
  }, [
    syncGraph,
    syncInputsReady,
    thoughtsIsFetching,
    foldersIsFetching,
    thoughts,
    allFolders,
    activeWorkspaceId,
    mutateGraph,
  ]);

  const isLoading =
    !hierarchies &&
    (syncGraph
      ? !syncInputsReady ||
        thoughtsIsFetching ||
        foldersIsFetching ||
        !thoughts ||
        !allFolders
      : graphQuery.isLoading);

  return {
    syncGraph,
    hierarchies,
    isLoading,
    refetchGraph: graphQuery.refetch,
    refetchSyncFlag: refetchSyncGraph,
  };
};
