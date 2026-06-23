import { useControllers } from "@/api/controllers/useControllers";
import { REACT_QUERY_KEYS } from "@/api/endpoints/KEYS";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";
import { TopicWithNotesInfos } from "@repo/zod-schemas/src/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";

export const useTopicDetailsData = () => {
  const local = useLocalSearchParams<{ id: string }>();
  const topicId = typeof local.id === "string" ? local.id : local.id?.[0];
  const queryClient = useQueryClient();
  const { useFetchNoteByTopic } = useControllers().notesAndThoughts;

  const { data, isPending } = useFetchNoteByTopic(topicId ?? "", {
    enabled: !!topicId,
  });

  const notes = useMemo(() => parseNoteAndThoughts(data), [data]);

  const topicName = useMemo(() => {
    const fromNotes = notes?.[0]?.topicName;
    if (fromNotes) return fromNotes;

    const cachedTopics = queryClient.getQueryData<TopicWithNotesInfos[]>([
      REACT_QUERY_KEYS.fetchAllTopicsWithNotesInfos,
    ]);
    return cachedTopics?.find((topic) => topic.id === topicId)?.name;
  }, [notes, queryClient, topicId]);

  return { topicId, topicName, isPending, notes };
};
