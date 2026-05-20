import { SearchResultsSchemaModel } from "@repo/zod-schemas";
import { View } from "react-native";
import { SearchResultItem } from "./searchResultItem";

export type SearchResults = {
  query: string;
  data: SearchResultsSchemaModel;
};

export const SearchResultsList = ({ query, data }: SearchResults) => {
  return (
    <View>
      {data.map((item, idx) => (
        <SearchResultItem key={idx} data={item} query={query} />
      ))}
    </View>
  );
};
