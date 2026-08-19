import { View } from "react-native";
import { NoteWithoutOverview } from "@/features/contentList/components/cards/noteWithoutOverview";
import { FolderSection } from "../components/folderSection";
import { PaginationControls } from "@/features/contentList/features/pagination/components/paginationControls";
import { usePaginatedNotesControls } from "@/features/contentList/features/pagination/hooks/usePaginatedNotes";
import { useGroupByFoldersNotesWithoutOverviewData } from "../hooks/useGroupByFoldersNotesData";

export const NotesListGroupByFoldersWithoutOverviewFeature = () => {
  const parsedData = useGroupByFoldersNotesWithoutOverviewData();
  const { page, pageCount, setPage, isFetching } = usePaginatedNotesControls();

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
            <NoteWithoutOverview
              key={note.id}
              id={note.id}
              title={note.title}
              summary={note.summary}
              rawText={note.rawText}
              folderId={note.folderId ?? folder.id}
              folderLabel={note.folderLabel ?? folder.name}
              createdAt={note.createdAt ?? ""}
            />
          ))}
        </FolderSection>
      ))}
      <PaginationControls
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        isFetching={isFetching}
      />
    </View>
  );
};
