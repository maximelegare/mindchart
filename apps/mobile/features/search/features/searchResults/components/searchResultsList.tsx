import { SearchResultsSchemaModel } from "@repo/zod-schemas";
import { View } from "react-native";
import { SearchResultItem } from "./searchResultItem";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui";
import { groupSearchResultsByNote } from "@/features/search/features/searchOptions/groupByNote/groupByNote";

export type SearchResults = {
  query: string;
  data: SearchResultsSchemaModel;
};

export const SearchResultsList = ({ query, data }: SearchResults) => {
  const groupedResults = groupSearchResultsByNote(data);
  return (
    <Card>
      <View className="flex-1 py-2 justify-center items-center">
        <Typography variant="p">{data.length} results found</Typography>
      </View>
      {groupedResults.map((item, idx) => (
        <View key={idx}>
          <SearchResultItem data={item} query={query} />
          {idx !== data.length - 1 && (
            <View className="h-[1px] bg-input w-full" />
          )}
        </View>
      ))}
    </Card>
  );
};
