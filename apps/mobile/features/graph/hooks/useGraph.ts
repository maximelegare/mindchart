import { useControllers } from "@/api/controllers/useControllers";
import { buildGraphWithTopics } from "../utils/buildGraphWithTopics";
import { ThoughtWithEmbedding } from "@repo/zod-schemas";
import { useEffect, useState, useCallback } from "react";

export type NodeDatum = {
  id: string;
  name: string;
  value?: number;
  children?: Array<NodeDatum>;
};

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

  // Sync flag
  const { data: syncFlag, refetch: refetchSyncGraph } = useFetchSyncGraphQuery({
    staleTime: 30_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const syncGraph = syncFlag?.data;

  // Thoughts only load when syncing
  const { data: thoughts } = useFetchAllThoughtsWithEmbeddingsQuery({
    enabled: syncGraph,
  });

  // Graph loads only when NOT syncing
  const graphQuery = useFetchGraphDataQuery({
    enabled: !syncGraph,
  });

  const graphData = graphQuery.data?.data;

  const [hierarchy, setHierarchy] = useState<NodeDatum | null>(null);

  // -------------------------------
  // Rebuild the graph (NOW SIMPLE)
  const rebuildGraph = useCallback(async () => {
    if (!thoughts) return;

    // ✅ No filtering needed unless you want to exclude null topics
    const newHierarchy = buildGraphWithTopics(
      thoughts as ThoughtWithEmbedding[]
    ) as NodeDatum;

    setHierarchy(newHierarchy);

    // Sync to DB
    await mutateGraph(newHierarchy);
  }, [thoughts, mutateGraph]);

  // Load DB graph when not syncing
  useEffect(() => {
    if (!syncGraph && graphData) {
      setHierarchy(graphData);
    }
  }, [syncGraph, graphData]);

  // Recompute graph when syncing
  useEffect(() => {
    if (!syncGraph) return;
    rebuildGraph();
  }, [syncGraph, rebuildGraph]);

  return {
    syncGraph,
    hierarchy,
    rebuildGraph,
    refetchGraph: graphQuery.refetch,
    refetchSyncFlag: refetchSyncGraph,
  };
};
