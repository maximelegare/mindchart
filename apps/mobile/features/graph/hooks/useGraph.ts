import { useControllers } from "@/api/controllers/useControllers";
import { buildGraphWithTopics } from "../utils/buildGraphWithTopics";
import { ThoughtWithEmbedding } from "@repo/zod-schemas";
import { useEffect, useState, useCallback } from "react";
import { useWorkspacesStore } from "@/features/workspaces/context/workspacesContext";

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

  // Thoughts only load when syncing.
  // `isFetching` is used by the rebuild effect below to wait for fresh data —
  // without it, `thoughts` would briefly hold the previous (stale) array while
  // refetching, causing rebuildGraph to build an empty hierarchy and flip
  // sync_graph=false before the fresh thoughts arrive.
  const { data: thoughts, isFetching: thoughtsIsFetching } =
    useFetchAllThoughtsWithEmbeddingsQuery({
      enabled: syncGraph,
    });

  // Graph loads only when NOT syncing
  const graphQuery = useFetchGraphDataQuery({
    enabled: !syncGraph,
  });

  const graphData = graphQuery.data?.data;

  const [hierarchy, setHierarchy] = useState<NodeDatum | null>(null);

  // Reset hierarchy whenever the active workspace changes — otherwise the
  // old workspace's React useState lingers and the graph briefly renders
  // stale nodes while the new queries refetch.
  const activeWorkspaceId = useWorkspacesStore((s) => s.activeWorkspaceId);
  useEffect(() => {
    setHierarchy(null);
  }, [activeWorkspaceId]);

  const rebuildGraph = useCallback(async () => {
    if (!thoughts) return;

    const newHierarchy = buildGraphWithTopics(
      thoughts as ThoughtWithEmbedding[]
    ) as NodeDatum;

    setHierarchy(newHierarchy);

    await mutateGraph(newHierarchy);
  }, [thoughts, mutateGraph]);

  // Load DB graph when not syncing. Guard against the freshly-seeded
  // empty `graph_data = "{}"` shape (parsed into `{}` with no `id`),
  // which would otherwise overwrite a valid hierarchy with an empty
  // object and break downstream rendering of ThoughtsList/ThoughtItem.
  useEffect(() => {
    if (!syncGraph && graphData && (graphData as NodeDatum).id) {
      setHierarchy(graphData);
    }
  }, [syncGraph, graphData]);

  // Recompute graph when syncing. Wait for thoughts to NOT be fetching, so
  // we don't trigger a rebuild with the previous workspace's / pre-seed stale
  // thoughts array. After the fresh thoughts settle, this effect re-runs.
  useEffect(() => {
    if (!syncGraph) return;
    if (thoughtsIsFetching) return;
    rebuildGraph();
  }, [syncGraph, thoughtsIsFetching, rebuildGraph]);

  return {
    syncGraph,
    hierarchy,
    rebuildGraph,
    refetchGraph: graphQuery.refetch,
    refetchSyncFlag: refetchSyncGraph,
  };
};
