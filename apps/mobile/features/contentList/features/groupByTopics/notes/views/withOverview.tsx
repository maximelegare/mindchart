import { View } from "react-native";
import { BulletList } from "@/components/ui/bulletList";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { useState } from "react";
import { ExpandableNoteWithThoughts } from "@/features/contentList/components/cards/noteWithOverview";
import { TopicSection } from "../components/topicSection";
import { useGroupByTopicsNotesData } from "../hooks/useGroupByTopicsNotesData";

export const NotesListGroupByTopicsWithOverviewFeature = () => {
  const parsedData = useGroupByTopicsNotesData();
  const [expandedCardId, setExpandedCardId] = useState<string | null>();

  const handleExpandableCardPress = (id: string) => {
    if (expandedCardId === id) setExpandedCardId(null);
    else setExpandedCardId(id);
  };

  if (!parsedData) return null;

  return (
    <View className="gap-4">
      {parsedData.map((topic) => (
        <TopicSection key={topic.id} name={topic.name}>
          {topic.notes.map((note) => (
            <ExpandableNoteWithThoughts
              key={note.id}
              id={note.id}
              title={note.title}
              category="idea"
              date={note.createdAt ?? ""}
              expanded={expandedCardId === note.id}
              onPress={handleExpandableCardPress}
            >
              <View className="gap-3 mt-2">
                <Separator />
                <BulletList
                  bulletClassName="mt-[10px]"
                  bulletColor="border"
                  items={note.thoughts.map((thought, idx) => (
                    <View key={idx}>
                      <Typography variant="p">{thought.summary}</Typography>
                    </View>
                  ))}
                />
              </View>
            </ExpandableNoteWithThoughts>
          ))}
        </TopicSection>
      ))}
    </View>
  );
};
