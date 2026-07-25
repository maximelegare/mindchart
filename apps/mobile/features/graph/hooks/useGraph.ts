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

export type { NodeDatum };

export type NodeType = {
  x: number;
  y: number;
  r: number;
  depth: number;
  name: string;
  children: boolean;
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

  const { data: thoughts, isFetching: thoughtsIsFetching } =
    useFetchAllThoughtsWithEmbeddingsQuery({
      enabled: syncGraph,
    });

  const { data: allFolders, isFetching: foldersIsFetching } =
    useFetchAllFoldersQuery({
      enabled: syncGraph,
    });

  const graphQuery = useFetchGraphDataQuery({
    enabled: !syncGraph,
  });

  const graphData = graphQuery.data?.data;

  const [hierarchies, setHierarchies] = useState<GraphDataCache | null>(null);
  const builtForRef = useRef<string | null>(null);

  const activeWorkspaceId = useWorkspacesStore((s) => s.activeWorkspaceId);
  useEffect(() => {
    setHierarchies(null);
    builtForRef.current = null;
  }, [activeWorkspaceId]);

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
      thoughtsIsFetching ||
      foldersIsFetching ||
      !thoughts ||
      !allFolders
    )
      return;

    const cacheKey = `thoughts:${activeWorkspaceId}:${thoughts.length}:${allFolders.length}`;
    if (builtForRef.current === cacheKey) return;

    const id = setTimeout(() => {
      const typedThoughts = thoughts as ThoughtWithEmbedding[];
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
      ? thoughtsIsFetching || foldersIsFetching || !thoughts || !allFolders
      : graphQuery.isLoading);

  return {
    syncGraph,
    hierarchies,
    isLoading,
    refetchGraph: graphQuery.refetch,
    refetchSyncFlag: refetchSyncGraph,
  };
};
