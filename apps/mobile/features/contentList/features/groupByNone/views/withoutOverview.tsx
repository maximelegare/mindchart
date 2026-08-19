import { View } from "react-native";
import { NoteWithoutOverview } from "@/features/contentList/components/cards/noteWithoutOverview";
import { PaginationControls } from "@/features/contentList/features/pagination/components/paginationControls";
import { usePaginatedNotesPlain } from "@/features/contentList/features/pagination/hooks/usePaginatedNotes";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export const NotesListWithoutOverviewFeature = () => {
  const { items, page, pageCount, setPage, isFetching, refetch } =
    usePaginatedNotesPlain();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return (
    <View className="gap-2" style={{ paddingTop: 20 }}>
      {items.map((n) => (
        <NoteWithoutOverview key={n.id} {...n} />
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
