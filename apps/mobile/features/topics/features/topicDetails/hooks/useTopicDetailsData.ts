import { useControllers } from "@/api/controllers/useControllers";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";

export const useTopicDetailsData = () => {
  const local = useLocalSearchParams<{ id: string }>();
  const topicId = typeof local.id === "string" ? local.id : local.id?.[0];
  const { useFetchNoteByTopic } = useControllers().notesAndThoughts;

  const { data, isPending } = useFetchNoteByTopic(topicId ?? "", {
    enabled: !!topicId,
  });

  const notes = useMemo(() => parseNoteAndThoughts(data), [data]);

  return { topicId, isPending, notes };
};
