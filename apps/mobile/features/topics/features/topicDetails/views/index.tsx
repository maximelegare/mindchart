import { BulletList } from "@/components/ui/bulletList";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { ExpandableNoteWithThoughts } from "@/features/contentList/components/cards/noteWithOverview";
import { useTopicDetailsData } from "@/features/topics/features/topicDetails/hooks/useTopicDetailsData";
import { View } from "react-native";

export const TopicDetailsFeature = () => {
  const { topicId, isPending, notes } = useTopicDetailsData();

  if (isPending || !topicId) return null;
  if (!notes) return null;

  if (notes.length === 0) {
    return (
      <View style={{ paddingTop: 20 }}>
        <Typography variant="muted">No notes in this topic yet.</Typography>
      </View>
    );
  }

  return (
    <View className="gap-2" style={{ paddingTop: 20 }}>
      {notes.map((note) => (
        <ExpandableNoteWithThoughts
          key={note.id}
          id={note.id}
          title={note.title}
          category="idea"
          date={note.createdAt ?? ""}
          topic={note.topicName}
          defaultInternalExpanded={true}
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
    </View>
  );
};
