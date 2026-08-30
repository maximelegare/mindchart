import { View } from "react-native";
import { NoteWithoutOverview } from "@/features/contentList/components/cards/noteWithoutOverview";
import { PaginationControls } from "@/features/contentList/features/pagination/components/paginationControls";
import { DateSection } from "../components/dateSection";
import {
  useGroupByDatesNotesPagination,
  useGroupByDatesNotesWithoutOverviewData,
} from "../hooks/useGroupByDatesNotesData";

export const NotesListGroupByDatesWithoutOverviewFeature = () => {
  const parsedData = useGroupByDatesNotesWithoutOverviewData();
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
            <NoteWithoutOverview key={note.id} {...note} />
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
