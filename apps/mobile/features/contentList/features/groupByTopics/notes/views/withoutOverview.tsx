import { View } from "react-native";
import { NoteWithoutOverview } from "@/features/contentList/components/cards/noteWithoutOverview";
import { TopicSection } from "../components/topicSection";
import { useGroupByTopicsNotesData } from "../hooks/useGroupByTopicsNotesData";

export const NotesListGroupByTopicsWithoutOverviewFeature = () => {
  const parsedData = useGroupByTopicsNotesData();

  if (!parsedData) return null;

  return (
    <View className="gap-4">
      {parsedData.map((topic) => (
        <TopicSection key={topic.id} name={topic.name}>
          {topic.notes.map((note) => (
            <NoteWithoutOverview
              key={note.id}
              id={note.id}
              title={note.title}
              summary={note.summary}
              rawText={note.rawText}
              topicId={topic.id}
              createdAt={note.created_at ?? ""}
            />
          ))}
        </TopicSection>
      ))}
    </View>
  );
};
