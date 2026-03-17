import { useControllers } from "@/api/controllers/useControllers";
import { buildHierarchyFromClusters } from "@/features/kNN/graph/buildHierarchy";
import { buildKNNGraph } from "@/features/kNN/utils/kNN";
import { labelPropagation } from "@/features/kNN/utils/labelPropagation";
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
  // Rebuild the graph (can be called manually)
  const rebuildGraph = useCallback(async () => {
    if (!thoughts || thoughts.length === 0) return;

    const thoughtsWithEmbeddings = thoughts.filter((t) => t.embedding !== null);
    if (thoughtsWithEmbeddings.length === 0) return;

    // 1️⃣ Build kNN graph
    const edges = buildKNNGraph(
      thoughtsWithEmbeddings as ThoughtWithEmbedding[],
      5
    );

    // 2️⃣ Community detection
    const nodeIds = thoughtsWithEmbeddings.map((t) => t.thoughtId);
    const clusters = labelPropagation(nodeIds, edges);

    // 3️⃣ Build hierarchy
    const newHierarchy = buildHierarchyFromClusters(
      thoughtsWithEmbeddings as ThoughtWithEmbedding[],
      clusters
    ) as NodeDatum;

    setHierarchy(newHierarchy);

    // 4️⃣ Sync to DB
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
    rebuildGraph, // expose this function
    refetchGraph: graphQuery.refetch,
    refetchSyncFlag: refetchSyncGraph,
  };
};
