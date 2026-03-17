import { ThoughtWithEmbedding } from "@repo/zod-schemas/client";

/**
 * Build a hierarchy JSON from thoughts and cluster mapping
 * @param thoughts All thoughts in category
 * @param clusters Mapping of thoughtId -> clusterId
 */
export function buildHierarchyFromClusters(
  thoughts: ThoughtWithEmbedding[],
  clusters: Record<string, string>
) {
  // 1. group by category
  const byCategory = new Map<
    string,
    { thought: ThoughtWithEmbedding; cluster: string }[]
  >();

  thoughts.forEach((t) => {
    if (!t.embedding) return; // skip thoughts without embeddings
    const c = clusters[t.thoughtId];
    if (!c) return; // skip if cluster not assigned

    if (!byCategory.has(t.categoryId)) byCategory.set(t.categoryId, []);
    byCategory.get(t.categoryId)!.push({ thought: t, cluster: c });
  });

  // 2. generate unique IDs
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

  // 3. build hierarchy
  return {
    id: getUniqueId("root"),
    name: "root",
    children: Array.from(byCategory.entries()).map(([category, list]) => {
      const byCluster = new Map<string, ThoughtWithEmbedding[]>();
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
              id: t.thoughtId,
              name: t.title || "Untitled",
              value: t.embedding?.length ? 1 : 1,
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
