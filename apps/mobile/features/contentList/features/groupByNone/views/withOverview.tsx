import { View } from "react-native";
import { NoteWithThoughts } from "@/features/contentList/components/cards/noteWithOverview";
import { useMemo } from "react";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";
import {
  useNotesAttributeFilters,
  useSelectedFolderId,
} from "@/features/contentList/hooks/useContentListFilter";
import { useContentListSort } from "@/features/contentList/hooks/useContentListSort";
import { filterNotesByAttributes } from "@/features/contentList/utils/filterNotesByAttributes";
import { sortContentList } from "@/features/contentList/utils/sortContentList";
import { useControllers } from "@/api/controllers/useControllers";

export const NotesListWithOverviewFeature = () => {
  const sortBy = useContentListSort();
  const selectedFolderId = useSelectedFolderId();
  const attributeFilters = useNotesAttributeFilters();
  const { useFetchNotesAndThoughtsQuery } = useControllers().notesAndThoughts;
  const { data } = useFetchNotesAndThoughtsQuery();

  const parsedData = useMemo(() => {
    const notes = parseNoteAndThoughts(data);
    if (!notes) return null;

    const byFolder = selectedFolderId
      ? notes.filter((note) => note.folderId === selectedFolderId)
      : notes;
    const filtered = filterNotesByAttributes(byFolder, attributeFilters);

    return sortContentList(filtered, sortBy, {
      getName: (note) => note.title,
      getDate: (note) => note.createdAt,
    });
  }, [attributeFilters, data, selectedFolderId, sortBy]);

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
