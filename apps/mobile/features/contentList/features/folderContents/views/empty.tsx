import { useMemo } from "react";
import { View } from "react-native";
import { Typography } from "@/components/ui";
import { useControllers } from "@/api/controllers/useControllers";
import { NoteWithoutOverview } from "@/features/contentList/components/cards/noteWithoutOverview";
import { useOptionsBar } from "@/features/contentList/components/optionsBar/context/optionBarContext";
import { normalizeNotesFromQuery } from "@/features/contentList/utils/normalizeNotesFromQuery";
import { useContentListSort } from "@/features/contentList/hooks/useContentListSort";
import { sortContentList } from "@/features/contentList/utils/sortContentList";

/** Notes assigned to the current folder (via folderId). */
export const FolderContentsView = () => {
  const currentFolderId = useOptionsBar((s) => s.currentFolderId);
  const sortBy = useContentListSort();
  const { folders } = useControllers();
  const { data } = folders.useFetchFolderContentsQuery(currentFolderId);

  const notes = useMemo(() => {
    const parsed = normalizeNotesFromQuery(data);
    if (!parsed) return [];
    return sortContentList(parsed, sortBy, {
      getName: (note) => note.title,
      getDate: (note) => note.createdAt,
    });
  }, [data, sortBy]);

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
        <NoteWithoutOverview key={note.id} {...note} />
      ))}
    </View>
  );
};
