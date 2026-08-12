import { View } from "react-native";
import { NoteWithThoughts } from "@/features/contentList/components/cards/noteWithOverview";
import { FolderSection } from "../components/folderSection";
import { useGroupByFoldersNotesWithOverviewData } from "../hooks/useGroupByFoldersNotesData";

export const NotesListGroupByFoldersWithOverviewFeature = () => {
  const parsedData = useGroupByFoldersNotesWithOverviewData();

  if (!parsedData) return null;

  return (
    <View style={{ gap: 30, paddingTop: 20 }}>
      {parsedData.map((folder) => (
        <FolderSection
          key={folder.id}
          name={folder.name}
          numberOfItems={folder.notes.length}
        >
          {folder.notes.map((note) => (
            <NoteWithThoughts
              key={note.id}
              id={note.id}
              title={note.title}
              category="idea"
              date={note.createdAt ?? ""}
              overviewItems={note.thoughts.map((thought) => thought.summary)}
            />
          ))}
        </FolderSection>
      ))}
    </View>
  );
};
