import { View } from "react-native";
import { useMemo } from "react";
import { NoteWithoutOverview } from "@/features/contentList/components/cards/noteWithoutOverview";
import { useControllers } from "@/api/controllers/useControllers";
import { NoteSchema } from "@repo/zod-schemas";
import z from "zod";

export const NotesListWithoutOverviewFeature = () => {
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
    return result.success ? result.data : null;
  }, [data]);

  return (
    <View className="gap-2">
      {parsedData?.map((n) => (
        <NoteWithoutOverview key={n.id} {...n} />
      ))}
    </View>
  );
};
