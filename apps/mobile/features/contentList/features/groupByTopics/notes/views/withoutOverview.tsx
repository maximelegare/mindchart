import { View } from "react-native";
import { NoteWithoutOverview } from "@/features/contentList/components/cards/noteWithoutOverview";
import { TopicSection } from "../components/topicSection";
import { useGroupByTopicsNotesWithoutOverviewData } from "../hooks/useGroupByTopicsNotesData";

export const NotesListGroupByTopicsWithoutOverviewFeature = () => {
  const parsedData = useGroupByTopicsNotesWithoutOverviewData();

  if (!parsedData) return null;

  return (
    <View style={{ gap: 24 }}>
      {parsedData.map((topic) => (
        <TopicSection key={topic.id} name={topic.name}>
          {topic.notes.map((note) => (
            <NoteWithoutOverview
              key={note.id}
              id={note.id}
              title={note.title}
              summary={note.summary}
              rawText={note.rawText}
              topicId={note.topicId ?? topic.id}
              topicName={note.topicName ?? topic.name}
              createdAt={note.createdAt ?? ""}
            />
          ))}
        </TopicSection>
      ))}
    </View>
  );
};
