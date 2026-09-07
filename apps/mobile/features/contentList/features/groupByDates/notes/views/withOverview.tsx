import { View } from "react-native";
import {
  NoteWithThoughts,
  thoughtToOverviewItem,
} from "@/features/contentList/components/cards/noteWithOverview";
import { PaginationControls } from "@/features/contentList/features/pagination/components/paginationControls";
import { DateSection } from "../components/dateSection";
import {
  useGroupByDatesNotesPagination,
  useGroupByDatesNotesWithOverviewData,
} from "../hooks/useGroupByDatesNotesData";

export const NotesListGroupByDatesWithOverviewFeature = () => {
  const parsedData = useGroupByDatesNotesWithOverviewData();
  const { page, pageCount, setPage, isFetching } =
    useGroupByDatesNotesPagination();

  if (!parsedData) return null;

  return (
    <View style={{ gap: 30, paddingTop: 20 }}>
      {parsedData.map((group) => (
        <DateSection
          key={group.id}
          dateKey={group.dateKey}
          numberOfItems={group.notes.length}
        >
          {group.notes.map((note) => (
            <NoteWithThoughts
              key={note.id}
              id={note.id}
              title={note.title}
              category="idea"
              date={note.createdAt ?? ""}
              overviewItems={note.thoughts.map(thoughtToOverviewItem)}
            />
          ))}
        </DateSection>
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
