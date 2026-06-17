import { View } from "react-native";
import { useMemo } from "react";
import { NoteWithoutOverview } from "../components/noteWithoutOverview";
import { useControllers } from "@/api/controllers/useControllers";
import { NoteSchema } from "@repo/zod-schemas";
import z from "zod";

export const NotesListWithoutOverviewFeature = () => {
  const { useFetchAllNotesQuery } = useControllers().notesAndThoughts;
  const { data } = useFetchAllNotesQuery();

  const parsedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return null;
    const result = z.array(NoteSchema).safeParse(data);
    return result.success ? result.data : null;
  }, [data]);

  if (!parsedData) return null;

  return (
    <View className="gap-2">
      {parsedData.map((n) => (
        <NoteWithoutOverview key={n.id} {...n} />
      ))}
    </View>
  );
};
