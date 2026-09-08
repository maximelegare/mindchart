import { SearchResultsSchemaModel } from "@repo/zod-schemas";
import { View } from "react-native";
import { SearchResultItem } from "./searchResultItem";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui";
import { groupSearchResultsByNote } from "@/features/search/features/searchOptions/groupByNote/groupByNote";
import { PaginationControls } from "@/features/contentList/features/pagination/components/paginationControls";
import { SearchResultsFoundLabel } from "@/features/search/searchLabels";

export type SearchResults = {
  query: string;
  data: SearchResultsSchemaModel;
  totalCount: number;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  isFetching?: boolean;
};

export const SearchResultsList = ({
  query,
  data,
  totalCount,
  page,
  pageCount,
  onPageChange,
  isFetching = false,
}: SearchResults) => {
  const groupedResults = groupSearchResultsByNote(data);
  return (
    <View className="pb-8">
      <Card>
        <View className="flex-1 py-2 justify-center items-center">
          <Typography variant="p">
            <SearchResultsFoundLabel count={totalCount} />
          </Typography>
        </View>
        {groupedResults.map((item, idx) => (
          <View key={item.noteId}>
            <SearchResultItem data={item} query={query} />
            {idx !== groupedResults.length - 1 && (
              <View className="h-[1px] bg-input w-full" />
            )}
          </View>
        ))}
      </Card>
      <PaginationControls
        page={page}
        pageCount={pageCount}
        onPageChange={onPageChange}
        isFetching={isFetching}
      />
    </View>
  );
};
