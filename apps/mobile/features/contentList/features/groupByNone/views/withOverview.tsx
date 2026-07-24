import { View } from "react-native";
import { NoteWithThoughts } from "@/features/contentList/components/cards/noteWithOverview";
import { useMemo } from "react";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";
import { useSelectedFolderId } from "@/features/contentList/hooks/useContentListFilter";
import { useContentListSort } from "@/features/contentList/hooks/useContentListSort";
import { sortContentList } from "@/features/contentList/utils/sortContentList";
import { useControllers } from "@/api/controllers/useControllers";

export const NotesListWithOverviewFeature = () => {
  const sortBy = useContentListSort();
  const selectedFolderId = useSelectedFolderId();
  const { useFetchNotesAndThoughtsQuery } = useControllers().notesAndThoughts;
  const { data } = useFetchNotesAndThoughtsQuery();

  const parsedData = useMemo(() => {
    const notes = parseNoteAndThoughts(data);
    if (!notes) return null;

    const filtered = selectedFolderId
      ? notes.filter((note) => note.folderId === selectedFolderId)
      : notes;

    return sortContentList(filtered, sortBy, {
      getName: (note) => note.title,
      getDate: (note) => note.createdAt,
    });
  }, [data, selectedFolderId, sortBy]);

  return (
    <View className="gap-2" style={{ paddingTop: 20 }}>
      {parsedData?.map((n) => (
        <NoteWithThoughts
          key={n.id}
          id={n.id}
          title={n.title}
          category="idea"
          date={n.createdAt ?? ""}
          overviewItems={n.thoughts.map((t) => t.summary)}
        />
      ))}
    </View>
  );
};
