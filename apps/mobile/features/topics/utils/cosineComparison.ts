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

function getAdjustedSimilarity(
  textA: string,
  textB: string,
  vectorSim: number
): number {
  const wordsA = textA.toLowerCase().split(" ");
  const wordsB = textB.toLowerCase().split(" ");

  // If they share a word (like "Health"), give it a 15% boost
  const hasOverlap = wordsA.some(
    (word) => word.length > 3 && wordsB.includes(word)
  );

  return hasOverlap ? Math.min(vectorSim + 0.15, 1.0) : vectorSim;
}

export function findClosestEmbedding(
  target: { embedding: Float32Array; text: string },
  embeddings: { embedding: Float32Array; text: string }[],
  threshold = 0.6 // Adjust this based on Nomic's behavior
): MatchResult | null {
  if (embeddings.length === 0) return null;

  let bestIndex = -1;
  let bestSimilarity = -1;

  for (let i = 0; i < embeddings.length; i++) {
    const sim = cosineSimilarity(target.embedding, embeddings[i].embedding);

    // Adjust the similarity based on the overlap of words
    const adjustedSim = getAdjustedSimilarity(
      embeddings[i].text,
      target.text,
      sim
    );

    // 1. Only consider it if it's above the threshold
    if (adjustedSim >= threshold) {
      // 2. Keep track of the highest one found so far
      if (adjustedSim > bestSimilarity) {
        bestSimilarity = adjustedSim;
        bestIndex = i;
      }
    }
  }

  // 3. If nothing was above the threshold, bestIndex remains -1
  if (bestIndex !== -1) {
    return { index: bestIndex, similarity: bestSimilarity };
  }

  return null;
}
