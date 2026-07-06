import { useControllers } from "@/api/controllers/useControllers";
import { warmupGraphLayouts } from "../components/graphSkia";
import { buildGraphByTopic } from "../utils/buildGraphByTopic";
import { buildGraphWithTopics } from "../utils/buildGraphWithTopics";
import { normalizeGraphData } from "../utils/parseGraphData";
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
  const { graph, notesAndThoughts } = useControllers();

  const {
    useFetchGraphDataQuery,
    useFetchSyncGraphQuery,
    useUpdateGraphDataMutation,
  } = graph;

  const { useFetchAllThoughtsWithEmbeddingsQuery } = notesAndThoughts;

  const { mutateAsync: mutateGraph } = useUpdateGraphDataMutation();

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

    const normalized = normalizeGraphData(graphData);
    if (!normalized) return;

    const cacheKey = `cached:${activeWorkspaceId}`;
    if (builtForRef.current === cacheKey) return;

    const id = setTimeout(() => {
      applyCache(normalized, cacheKey);
    }, 0);

    return () => clearTimeout(id);
  }, [syncGraph, graphData, activeWorkspaceId]);

  useEffect(() => {
    if (!syncGraph || thoughtsIsFetching || !thoughts) return;

    const cacheKey = `thoughts:${activeWorkspaceId}:${thoughts.length}`;
    if (builtForRef.current === cacheKey) return;

    const id = setTimeout(() => {
      const typedThoughts = thoughts as ThoughtWithEmbedding[];
      const cache: GraphDataCache = {
        category: buildGraphWithTopics(typedThoughts) as NodeDatum,
        topic: buildGraphByTopic(typedThoughts) as NodeDatum,
      };

      applyCache(cache, cacheKey);
      void mutateGraph(cache);
    }, 0);

    return () => clearTimeout(id);
  }, [syncGraph, thoughtsIsFetching, thoughts, activeWorkspaceId, mutateGraph]);

  const isLoading =
    !hierarchies &&
    (syncGraph ? thoughtsIsFetching || !thoughts : graphQuery.isLoading);

  return {
    syncGraph,
    hierarchies,
    isLoading,
    refetchGraph: graphQuery.refetch,
    refetchSyncFlag: refetchSyncGraph,
  };
};
