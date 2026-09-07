import { View } from "react-native";
import {
  NoteWithThoughts,
  thoughtToOverviewItem,
} from "@/features/contentList/components/cards/noteWithOverview";
import { PaginationControls } from "@/features/contentList/features/pagination/components/paginationControls";
import { usePaginatedNotes } from "@/features/contentList/features/pagination/hooks/usePaginatedNotes";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export const NotesListWithOverviewFeature = () => {
  const { items, page, pageCount, setPage, isFetching, refetch } =
    usePaginatedNotes({ withThoughts: true });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return (
    <View className="gap-2" style={{ paddingTop: 20 }}>
      {items.map((n) => (
        <NoteWithThoughts
          key={n.id}
          id={n.id}
          title={n.title}
          category="idea"
          date={n.createdAt ?? ""}
          overviewItems={n.thoughts.map(thoughtToOverviewItem)}
        />
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
