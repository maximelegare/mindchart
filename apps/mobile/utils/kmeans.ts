import { ThoughtWithEmbedding } from "@repo/zod-schemas/client";
import { kmeans } from "ml-kmeans";

export function runKMeans(
  thoughts: ThoughtWithEmbedding[],
  k: number
): number[] {
  // 1. filter out null embeddings
  const filtered: Float32Array[] = thoughts
    .map((t) => t.embedding)
    .filter((v): v is Float32Array => v !== null);

  // 2. convert Float32Array → number[] for ml-kmeans
  const vectors: number[][] = filtered.map((v) => Array.from(v));

  // 3. run k-means
  const result = kmeans(vectors, k, {});
  return result.clusters;
}

export function buildHierarchy(
  thoughts: ThoughtWithEmbedding[],
  clusters: number[]
) {
  // Create a mapping from thought index (with embedding) to cluster
  // Only thoughts with embeddings are included in clusters
  const thoughtsWithEmbeddings = thoughts.filter((t) => t.embedding !== null);
  const clusterMap = new Map<ThoughtWithEmbedding, number>();
  thoughtsWithEmbeddings.forEach((t, i) => {
    clusterMap.set(t, clusters[i]);
  });

  // 1. group by category
  const byCategory = new Map<
    string,
    { thought: ThoughtWithEmbedding; cluster: number }[]
  >();

  thoughts.forEach((t) => {
    // Only include thoughts with embeddings (they have clusters)
    if (t.embedding === null) return;
    const c = clusterMap.get(t);
    if (c === undefined) return; // Shouldn't happen, but safety check

    if (!byCategory.has(t.categoryId)) {
      byCategory.set(t.categoryId, []);
    }
    byCategory.get(t.categoryId)!.push({ thought: t, cluster: c });
  });

  // Track used IDs to ensure uniqueness
  const usedIds = new Set<string>();
  const getUniqueId = (baseId: string): string => {
    let id = baseId;
    let counter = 0;
    while (usedIds.has(id)) {
      id = `${baseId}-${counter++}`;
    }
    usedIds.add(id);
    return id;
  };

  // 2. Build the final hierarchy JSON
  return {
    id: getUniqueId("root"),
    name: "root",
    children: Array.from(byCategory.entries()).map(([category, list]) => {
      // group thoughts by cluster
      const byCluster = new Map<number, ThoughtWithEmbedding[]>();
      list.forEach(({ thought, cluster }) => {
        if (!byCluster.has(cluster)) byCluster.set(cluster, []);
        byCluster.get(cluster)!.push(thought);
      });

      return {
        id: getUniqueId(`category-${category}`),
        name: category,
        children: Array.from(byCluster.entries()).map(
          ([clusterId, thoughts]) => ({
            id: getUniqueId(`cluster-${category}-${clusterId}`),
            name: `cluster-${clusterId}`,
            categoryId: category,
            children: thoughts.map((t) => ({
              id: t.thoughtId, // Ensure thought IDs are unique too
              name: t.title || "Untitled",
              value: t.embedding?.length ? 1 : 1,
              // Include all thought fields
              thoughtId: t.thoughtId,
              title: t.title,
              summary: t.summary,
              noteId: t.noteId,
              categoryId: t.categoryId,
              createdAt: t.createdAt,
              embedding: t.embedding,
            })),
          })
        ),
      };
    }),
  };
}
