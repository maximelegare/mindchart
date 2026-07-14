import { View } from "react-native";
import { NoteWithThoughts } from "@/features/contentList/components/cards/noteWithOverview";
import { TopicSection } from "../components/topicSection";
import { useGroupByTopicsNotesWithOverviewData } from "../hooks/useGroupByTopicsNotesData";

export const NotesListGroupByTopicsWithOverviewFeature = () => {
  const parsedData = useGroupByTopicsNotesWithOverviewData();

  if (!parsedData) return null;

  return (
    <View style={{ gap: 30, paddingTop: 20 }}>
      {parsedData.map((topic) => (
        <TopicSection
          key={topic.id}
          id={topic.id}
          name={topic.name}
          numberOfItems={topic.notes.length}
        >
          {topic.notes.map((note) => (
            <NoteWithThoughts
              key={note.id}
              id={note.id}
              title={note.title}
              category="idea"
              date={note.createdAt ?? ""}
              topic={note.topicName ?? topic.name}
              overviewItems={note.thoughts.map((thought) => thought.summary)}
            />
          ))}
        </TopicSection>
      ))}
    </View>
  );
};
