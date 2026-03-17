import { ThoughtWithEmbedding } from "@repo/zod-schemas";
import { cosineSimilarity } from "./cosineSimilarity";

export type Edge = {
  from: string;
  to: string;
  weight: number; // similarity
};

/**
 * Build a k-Nearest Neighbor graph for a category of thoughts.
 * - Null embeddings are skipped
 * - K is adjusted if there are fewer thoughts
 */
export function buildKNNGraph(thoughts: ThoughtWithEmbedding[], K = 5): Edge[] {
  const edges: Edge[] = [];

  for (let i = 0; i < thoughts.length; i++) {
    const a = thoughts[i].embedding;
    if (!a) continue; // skip thoughts without embeddings

    const similarities: { id: string; score: number }[] = [];

    for (let j = 0; j < thoughts.length; j++) {
      if (i === j) continue;

      const b = thoughts[j].embedding;
      if (!b) continue; // skip null embeddings

      const sim = cosineSimilarity(a, b);
      similarities.push({ id: thoughts[j].id, score: sim });
    }

    if (similarities.length === 0) continue; // no neighbors to connect

    // Dynamically adjust K if there are fewer neighbors
    const effectiveK = Math.min(K, similarities.length);

    // Keep top neighbors
    similarities.sort((a, b) => b.score - a.score);
    const topK = similarities.slice(0, effectiveK);

    for (const neighbor of topK) {
      edges.push({
        from: thoughts[i].id,
        to: neighbor.id,
        weight: neighbor.score,
      });
    }
  }

  return edges;
}

/**
 * Incrementally add a new thought to an existing kNN graph.
 * @param newThought The newly added thought
 * @param existingThoughts All other thoughts in the same category
 * @param existingEdges Existing edges in the graph
 * @param K Number of neighbors
 */
export function addThoughtToKNNGraph(
  newThought: ThoughtWithEmbedding,
  existingThoughts: ThoughtWithEmbedding[],
  existingEdges: Edge[],
  K = 5
): Edge[] {
  const newEdges: Edge[] = [];

  if (!newThought.embedding) return existingEdges; // skip null embedding

  const similarities: { id: string; score: number }[] = [];

  for (const thought of existingThoughts) {
    if (!thought.embedding) continue;

    const sim = cosineSimilarity(newThought.embedding, thought.embedding);
    similarities.push({ id: thought.id, score: sim });
  }

  if (similarities.length > 0) {
    const effectiveK = Math.min(K, similarities.length);

    similarities.sort((a, b) => b.score - a.score);
    const topK = similarities.slice(0, effectiveK);

    for (const neighbor of topK) {
      newEdges.push({
        from: newThought.id,
        to: neighbor.id,
        weight: neighbor.score,
      });

      // Optional: make graph undirected by adding reciprocal edge
      newEdges.push({
        from: neighbor.id,
        to: newThought.id,
        weight: neighbor.score,
      });
    }
  }

  return [...existingEdges, ...newEdges];
}
