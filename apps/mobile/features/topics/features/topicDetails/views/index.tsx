import { Typography } from "@/components/ui/typography";
import { ExpandableNoteWithThoughts } from "@/features/contentList/components/cards/noteWithOverview";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";
import { View } from "react-native";

type TopicDetailsFeatureProps = {
  isPending: boolean;
  notes: ReturnType<typeof parseNoteAndThoughts>;
};

export const TopicDetailsFeature = ({
  isPending,
  notes,
}: TopicDetailsFeatureProps) => {
  if (isPending) return null;
  if (!notes) return null;

  if (notes.length === 0) {
    return (
      <View style={{ paddingTop: 20 }}>
        <Typography variant="muted">No notes in this topic yet.</Typography>
      </View>
    );
  }

  return (
    <View className="gap-2">
      {notes.map((note) => (
        <ExpandableNoteWithThoughts
          key={note.id}
          id={note.id}
          title={note.title}
          category="idea"
          date={note.createdAt ?? ""}
          topic={note.topicName}
          overviewItems={note.thoughts.map((thought) => thought.summary)}
        />
      ))}
    </View>
  );
};
