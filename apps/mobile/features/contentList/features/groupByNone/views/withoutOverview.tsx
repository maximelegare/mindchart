import { View } from "react-native";
import { useMemo } from "react";
import { NoteWithoutOverview } from "@/features/contentList/components/cards/noteWithoutOverview";
import { useSelectedTopicId } from "@/features/contentList/hooks/useContentListFilter";
import { useContentListSort } from "@/features/contentList/hooks/useContentListSort";
import { sortContentList } from "@/features/contentList/utils/sortContentList";
import { useControllers } from "@/api/controllers/useControllers";
import { NoteSchema } from "@repo/zod-schemas";
import z from "zod";

export const NotesListWithoutOverviewFeature = () => {
  const sortBy = useContentListSort();
  const selectedTopicId = useSelectedTopicId();
  const { useFetchAllNotesQuery } = useControllers().notesAndThoughts;
  const { data } = useFetchAllNotesQuery();

  const parsedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return null;
    const normalized = data.map((row) => ({
      ...row,
      topicId: row.topic_id ?? undefined,
      topicName: row.topic_name ?? undefined,
    }));
    const result = z.array(NoteSchema).safeParse(normalized);
    if (!result.success) return null;

    const filtered = selectedTopicId
      ? result.data.filter((note) => note.topicId === selectedTopicId)
      : result.data;

    return sortContentList(filtered, sortBy, {
      getName: (note) => note.title,
      getDate: (note) => note.createdAt,
    });
  }, [data, selectedTopicId, sortBy]);

  return (
    <View className="gap-2" style={{ paddingTop: 20 }}>
      {parsedData?.map((n) => (
        <NoteWithoutOverview key={n.id} {...n} />
      ))}
    </View>
  );
};
