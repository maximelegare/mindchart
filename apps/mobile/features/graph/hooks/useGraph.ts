import { useControllers } from "@/api/controllers/useControllers";
import { buildGraphByTopic } from "../utils/buildGraphByTopic";
import { buildGraphWithTopics } from "../utils/buildGraphWithTopics";
import { normalizeGraphData } from "../utils/parseGraphData";
import { ThoughtWithEmbedding } from "@repo/zod-schemas";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useWorkspacesStore } from "@/features/workspaces/context/workspacesContext";
import { GraphDataCache, GraphMode, NodeDatum } from "../types/types";

export type { NodeDatum };

export type NodeType = {
  x: number;
  y: number;
  r: number;
  depth: number;
  name: string;
  children: boolean;
};

export const useGraph = (mode: GraphMode) => {
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

  const hierarchy = useMemo(
    () => (hierarchies ? hierarchies[mode] : null),
    [hierarchies, mode]
  );

  const activeWorkspaceId = useWorkspacesStore((s) => s.activeWorkspaceId);
  useEffect(() => {
    setHierarchies(null);
  }, [activeWorkspaceId]);

  const rebuildGraph = useCallback(async () => {
    if (!thoughts) return;

    const typedThoughts = thoughts as ThoughtWithEmbedding[];
    const cache: GraphDataCache = {
      category: buildGraphWithTopics(typedThoughts) as NodeDatum,
      topic: buildGraphByTopic(typedThoughts) as NodeDatum,
    };

    setHierarchies(cache);
    await mutateGraph(cache);
  }, [thoughts, mutateGraph]);

  useEffect(() => {
    if (!syncGraph && graphData) {
      const normalized = normalizeGraphData(graphData);
      if (normalized) {
        setHierarchies(normalized);
      }
    }
  }, [syncGraph, graphData]);

  useEffect(() => {
    if (!syncGraph) return;
    if (thoughtsIsFetching) return;
    rebuildGraph();
  }, [syncGraph, thoughtsIsFetching, rebuildGraph]);

  return {
    syncGraph,
    hierarchy,
    hierarchies,
    rebuildGraph,
    refetchGraph: graphQuery.refetch,
    refetchSyncFlag: refetchSyncGraph,
  };
};
