import { Edge } from "./kNN";

/**
 * Simple label propagation community detection
 * @param nodes array of node IDs
 * @param edges array of edges (from, to, weight)
 * @param maxIterations max passes
 * @returns mapping of nodeId -> clusterId
 */
export function labelPropagation(
  nodes: string[],
  edges: Edge[],
  maxIterations = 10
): Record<string, string> {
  const labels: Record<string, string> = {};

  // Initialize each node with its own label
  nodes.forEach((n) => (labels[n] = n));

  for (let iter = 0; iter < maxIterations; iter++) {
    for (const node of nodes) {
      const neighborLabels: Record<string, number> = {};

      // Find neighbors of this node
      for (const e of edges.filter((e) => e.from === node || e.to === node)) {
        const neighbor = e.from === node ? e.to : e.from;
        const label = labels[neighbor];
        neighborLabels[label] = (neighborLabels[label] || 0) + 1;
      }

      // Choose the most common neighbor label
      const maxLabel = Object.entries(neighborLabels).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0];
      if (maxLabel) labels[node] = maxLabel;
    }
  }

  return labels; // nodeId -> clusterId
}
