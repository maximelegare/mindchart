interface MatchResult {
  index: number;
  similarity: number;
}

/**
 * Compute cosine similarity between two vectors
 */
/**
 * Compute cosine similarity with a small epsilon to prevent NaN
 */
function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  console.log("b", b);
  if (a.length !== b.length) {
    console.error(`Dimension mismatch: ${a.length} vs ${b.length}`);
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator < 1e-8) return 0; // Avoid division by zero

  return dot / denominator;
}

export function findClosestEmbedding(
  target: Float32Array,
  embeddings: Float32Array[],
  threshold = 0.5
): MatchResult | null {
  if (embeddings.length === 0) return null;

  let bestIndex = -1;
  let bestSimilarity = -1; // Cosine similarity is usually -1 to 1

  for (let i = 0; i < embeddings.length; i++) {
    const sim = cosineSimilarity(target, embeddings[i]);

    // DEBUG: Log the similarities to see why they are failing the threshold
    // console.log(`Index ${i} Similarity: ${sim.toFixed(4)}`);

    if (sim > bestSimilarity) {
      bestSimilarity = sim;
      bestIndex = i;
    }
  }

  if (bestSimilarity >= threshold) {
    return { index: bestIndex, similarity: bestSimilarity };
  }

  return null;
}
