import { useMemo } from "react";
import { View } from "react-native";
import { Typography } from "@/components/ui";
import { useControllers } from "@/api/controllers/useControllers";
import { NoteWithThoughts } from "@/features/contentList/components/cards/noteWithOverview";
import { useOptionsBar } from "@/features/contentList/components/optionsBar/context/optionBarContext";
import { useContentListSort } from "@/features/contentList/hooks/useContentListSort";
import { sortContentList } from "@/features/contentList/utils/sortContentList";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";

/** Notes assigned to the current folder (via folderId), with thought overviews. */
export const FolderContentsView = () => {
  const currentFolderId = useOptionsBar((s) => s.currentFolderId);
  const sortBy = useContentListSort();
  const { useFetchNotesAndThoughtsQuery } = useControllers().notesAndThoughts;
  const { data } = useFetchNotesAndThoughtsQuery();

  const notes = useMemo(() => {
    const parsed = parseNoteAndThoughts(data);
    if (!parsed || !currentFolderId) return [];

    const filtered = parsed.filter((note) => note.folderId === currentFolderId);

    return sortContentList(filtered, sortBy, {
      getName: (note) => note.title,
      getDate: (note) => note.createdAt,
    });
  }, [currentFolderId, data, sortBy]);

  if (notes.length === 0) {
    return (
      <View className="items-center justify-center px-6 py-10">
        <Typography variant="p" className="text-center text-muted-foreground">
          This folder is empty.
        </Typography>
      </View>
    );
  }

  return (
    <View className="gap-2" style={{ paddingTop: 12 }}>
      {notes.map((note) => (
        <NoteWithThoughts
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
