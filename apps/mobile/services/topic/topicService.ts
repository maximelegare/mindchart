// import { Topic } from "@repo/zod-schemas";

import { useControllers } from "@/api/controllers/useControllers";
import { findClosestEmbedding } from "./utils/cosineComparison";
import { useLlamaEmbeddings } from "@/features/llama/hooks/useLlamaEmbeddings";
import { Topic } from "@repo/zod-schemas";
import { generateID } from "@/utils/genrateID";

export const useTopicService = () => {
  const { useFetchAllTopicsQuery } = useControllers().topics;

  const { data: topics } = useFetchAllTopicsQuery();
  const { embed } = useLlamaEmbeddings();

  const findClosestTopic = async (topic: string): Promise<Topic> => {
    const topicEmbedding = await embed(topic);

    const closestTopic = findClosestEmbedding(
      topicEmbedding,
      topics?.map((topic) => topic.embedding) || []
    );

    if (closestTopic) {
      return topics?.[closestTopic.index] as Topic;
    } else {
      return {
        id: generateID(),
        name: topic,
        embedding: topicEmbedding,
        createdAt: new Date().toISOString(),
        isNew: true,
      };
    }
  };

  return {
    findClosestTopic,
  };
};
