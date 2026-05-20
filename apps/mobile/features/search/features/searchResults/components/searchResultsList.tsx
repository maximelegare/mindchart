import { Typography } from "@/components/ui";
import { Note, Thought } from "@repo/zod-schemas";
import { View } from "react-native";
import { SearchResultItem } from "./searchResultItem";

type Type = "notes" | "thoughts";

type SearchResult = {
  type: Type;
  name: string;
  results: Thought[] | Note[];
};

export type SearchResults = {
  results: SearchResult[];
};

export const SearchResultsList = ({ results }: SearchResults) => {
  return (
    <View>
      {results.map((resultCategory) => (
        <View key={resultCategory.type}>
          <Typography variant="h3" className="border-b border-input pb-2">
            {resultCategory.name}
          </Typography>
          {resultCategory.results.map((result) => (
            <View key={result.id}>
              <SearchResultItem
                type={resultCategory.type}
                result={result as Thought | Note}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};
