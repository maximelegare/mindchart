import { View } from "react-native";
import { BulletList } from "@/components/ui/bulletList";
import { ExpandableNoteWithThoughts } from "@/features/contentList/components/cards/noteWithOverview";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { useMemo, useState } from "react";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";
import { useControllers } from "@/api/controllers/useControllers";

export const NotesListWithOverviewFeature = () => {
  const { useFetchNotesAndThoughtsQuery } = useControllers().notesAndThoughts;
  const { data } = useFetchNotesAndThoughtsQuery();

  const parsedData = useMemo(() => parseNoteAndThoughts(data), [data]);
  const [expandedCardId, setExpandedCardId] = useState<string | null>();

  const handleExpandableCardPress = (id: string) => {
    if (expandedCardId === id) setExpandedCardId(null);
    else setExpandedCardId(id);
  };

  return (
    <View className="gap-2">
      {parsedData?.map((n) => (
        <ExpandableNoteWithThoughts
          key={n.id}
          id={n.id}
          title={n.title}
          category="idea"
          date={n.createdAt ?? ""}
          expanded={expandedCardId === n.id}
          onPress={handleExpandableCardPress}
        >
          <View className="gap-3 mt-2">
            <Separator />
            <BulletList
              bulletClassName="mt-[10px]"
              bulletColor="border"
              items={n.thoughts.map((t, idx: number) => (
                <View key={idx}>
                  <Typography variant="p">{t.summary}</Typography>
                </View>
              ))}
            ></BulletList>
          </View>
        </ExpandableNoteWithThoughts>
      ))}
    </View>
  );
};
