import { ThoughtWithEmbedding } from "@repo/zod-schemas/client";

export function buildGraphWithTopics(thoughts: ThoughtWithEmbedding[]) {
  // 1. Group by category
  const byCategory = new Map<string, ThoughtWithEmbedding[]>();

  thoughts.forEach((t) => {
    if (!byCategory.has(t.categoryId)) {
      byCategory.set(t.categoryId, []);
    }
    byCategory.get(t.categoryId)!.push(t);
  });

  // 2. Build hierarchy
  return {
    id: "root",
    name: "root",
    children: Array.from(byCategory.entries()).map(
      ([categoryId, categoryThoughts]) => {
        // 3. Group inside category by topic
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
              children: topicThoughts.map((t) => ({
                id: t.thoughtId,
                name: t.title || "Untitled",
                value: 1,

                // full payload
                thoughtId: t.thoughtId,
                title: t.title,
                summary: t.summary,
                noteId: t.noteId,
                categoryId: t.categoryId,
                topicId: t.topicId,
                topicName: t.topicName,
                createdAt: t.createdAt,
                embedding: t.embedding,
              })),
            })
          ),
        };
      }
    ),
  };
}
