import { useMemo } from "react";
import { View } from "react-native";
import { Typography } from "@/components/ui";
import { useControllers } from "@/api/controllers/useControllers";
import { NoteWithThoughts } from "@/features/contentList/components/cards/noteWithOverview";
import { useOptionsBar } from "@/features/contentList/components/optionsBar/context/optionBarContext";
import { useContentListSort } from "@/features/contentList/hooks/useContentListSort";
import { useNotesAttributeFilters } from "@/features/contentList/hooks/useContentListFilter";
import {
  filterNotesByAttributes,
  hasActiveAttributeFilters,
} from "@/features/contentList/utils/filterNotesByAttributes";
import { sortContentList } from "@/features/contentList/utils/sortContentList";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";

/** Notes assigned to the current folder (via folderId), with thought overviews. */
export const FolderContentsView = () => {
  const currentFolderId = useOptionsBar((s) => s.currentFolderId);
  const sortBy = useContentListSort();
  const attributeFilters = useNotesAttributeFilters();
  const filtersActive = hasActiveAttributeFilters(attributeFilters);
  const { useFetchNotesAndThoughtsQuery } = useControllers().notesAndThoughts;
  const { folders } = useControllers();
  const { data } = useFetchNotesAndThoughtsQuery();
  const { data: allFolders = [] } = folders.useFetchAllFoldersQuery();

  const currentFolder = useMemo(
    () => allFolders.find((folder) => folder.id === currentFolderId) ?? null,
    [allFolders, currentFolderId]
  );

  const { data: childFolders = [] } = folders.useFetchChildFoldersQuery(
    currentFolder?.path ?? null
  );

  const notes = useMemo(() => {
    const parsed = parseNoteAndThoughts(data);
    if (!parsed || !currentFolderId) return [];

    const inFolder = parsed.filter((note) => note.folderId === currentFolderId);
    const filtered = filterNotesByAttributes(inFolder, attributeFilters);

    return sortContentList(filtered, sortBy, {
      getName: (note) => note.title,
      getCreatedAt: (note) => note.createdAt,
      getUpdatedAt: (note) => note.updatedAt,
      getLastViewedAt: (note) => note.lastViewedAt,
    });
  }, [attributeFilters, currentFolderId, data, sortBy]);

  const hasChildFolders = (childFolders?.length ?? 0) > 0;

  if (notes.length === 0) {
    // Child folders already render above via FolderCardsList — don't call it empty.
    if (hasChildFolders) return null;

    return (
      <View className="items-center justify-center px-6 py-10">
        <Typography variant="p" className="text-center text-muted-foreground">
          {filtersActive
            ? "No notes match these filters."
            : "This folder is empty."}
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
          overviewItems={note.thoughts.map((thought) => thought.summary)}
        />
      ))}
    </View>
  );
};
