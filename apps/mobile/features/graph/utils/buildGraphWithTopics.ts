import { ThoughtWithEmbedding } from "@repo/zod-schemas/client";
import { mapThoughtToLeaf } from "./mapThoughtToLeaf";

export function buildGraphWithTopics(thoughts: ThoughtWithEmbedding[]) {
  const byCategory = new Map<string, ThoughtWithEmbedding[]>();

  thoughts.forEach((t) => {
    if (!byCategory.has(t.categoryId)) {
      byCategory.set(t.categoryId, []);
    }
    byCategory.get(t.categoryId)!.push(t);
  });

  return {
    id: "root",
    name: "root",
    children: Array.from(byCategory.entries()).map(
      ([categoryId, categoryThoughts]) => {
        const byTopic = new Map<string, ThoughtWithEmbedding[]>();

        categoryThoughts.forEach((t) => {
          const topic = t.topicId ?? "no-topic";

          if (!byTopic.has(topic)) {
            byTopic.set(topic, []);
          }
          byTopic.get(topic)!.push(t);
        });

        return {
          id: `category-${categoryId}`,
          name: categoryThoughts[0].categoryId ?? "Untitled",
          children: Array.from(byTopic.entries()).map(
            ([topicId, topicThoughts]) => ({
              id: `topic-${categoryId}-${topicId}`,
              name: topicThoughts[0].topicName ?? "Untitled",
              categoryId,
              topicId,
              children: topicThoughts.map(mapThoughtToLeaf),
            })
          ),
        };
      }
    ),
  };
}
