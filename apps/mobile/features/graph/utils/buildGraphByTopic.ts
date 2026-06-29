import { ThoughtWithEmbedding } from "@repo/zod-schemas/client";
import { mapThoughtToLeaf } from "./mapThoughtToLeaf";

export function buildGraphByTopic(thoughts: ThoughtWithEmbedding[]) {
  const byTopic = new Map<string, ThoughtWithEmbedding[]>();

  thoughts.forEach((t) => {
    const topic = t.topicId ?? "no-topic";
    if (!byTopic.has(topic)) {
      byTopic.set(topic, []);
    }
    byTopic.get(topic)!.push(t);
  });

  return {
    id: "root",
    name: "root",
    children: Array.from(byTopic.entries()).map(([topicId, topicThoughts]) => {
      const byCategory = new Map<string, ThoughtWithEmbedding[]>();

      topicThoughts.forEach((t) => {
        if (!byCategory.has(t.categoryId)) {
          byCategory.set(t.categoryId, []);
        }
        byCategory.get(t.categoryId)!.push(t);
      });

      return {
        id: `topic-${topicId}`,
        name: topicThoughts[0].topicName ?? "Untitled",
        topicId,
        children: Array.from(byCategory.entries()).map(
          ([categoryId, categoryThoughts]) => ({
            id: `category-${topicId}-${categoryId}`,
            name: categoryThoughts[0].categoryId ?? "Untitled",
            categoryId,
            topicId,
            children: categoryThoughts.map(mapThoughtToLeaf),
          })
        ),
      };
    }),
  };
}
