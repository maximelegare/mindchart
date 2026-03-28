interface MatchResult {
  index: number;
  similarity: number;
}

/**
 * Compute cosine similarity between two vectors
 */
function cosineSimilarity(
  a: Float32Array<ArrayBufferLike>,
  b: Float32Array<ArrayBufferLike>
): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Find closest embedding above a threshold
 */
export function findClosestEmbedding(
  target: Float32Array<ArrayBufferLike>,
  embeddings: Float32Array<ArrayBufferLike>[],
  threshold = 0.8 // tweak depending on your model
): MatchResult | null {
  let bestIndex = -1;
  let bestSimilarity = -Infinity;

  if (embeddings.length === 0) {
    return null;
  }

  for (let i = 0; i < embeddings.length; i++) {
    const sim = cosineSimilarity(target, embeddings[i]);

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
