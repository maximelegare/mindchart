import { View } from "react-native";
import { BulletList } from "@/components/ui/bulletList";
import { ExpandableNoteWithThoughts } from "@/features/notes/notesList/components/ExpandableNoteWithThoughts";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { useMemo, useState } from "react";
import { parseNoteAndThoughts } from "../../shared/utils/parseNoteAndThoughts";
import { useControllers } from "@/api/controllers/useControllers";
import { H4 } from "@/components/ui/typography";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { OptionsBar } from "../components/optionsBar";

export const NotesListFeature = () => {
  const { useFetchNotesAndThoughtsQuery } = useControllers().notesAndThoughts;
  const { data } = useFetchNotesAndThoughtsQuery();

  const parsedData = useMemo(() => parseNoteAndThoughts(data), [data]);
  const [expandedCardId, setExpandedCardId] = useState<string | null>();

  const handleExpandableCardPress = (id: string) => {
    if (expandedCardId === id) setExpandedCardId(null);
    else setExpandedCardId(id);
  };

  return (
    <View className="flex-1">
      <OptionsBar
        options={{
          sortBy: "newest",
          groupBy: "topics",
          display: ["notes", "topics", "categories"],
        }}
      />
      <View className="gap-2">
        {parsedData?.map((n) => (
          <ExpandableNoteWithThoughts
            key={n.id}
            id={n.id}
            title={n.title}
            category="idea"
            date={n.created_at}
            expanded={expandedCardId === n.id}
            onPress={handleExpandableCardPress}
          >
            <View className="gap-3 mt-2">
              <Separator />
              <BulletList
                bulletClassName="mt-[10px]"
                bulletColor="border"
                items={n.thoughts.map((t: any, idx: number) => (
                  <View key={idx}>
                    <H4>{t.title}</H4>
                    <Typography variant="p">{t.summary}</Typography>
                  </View>
                ))}
              ></BulletList>
            </View>
          </ExpandableNoteWithThoughts>
        ))}
      </View>
      <SpaceFiller
        sizes={{ marginBottom: ["TAB_BAR_HEIGHT", "HEADER_OVERLAP", 15] }}
      />
    </View>
  );
};
