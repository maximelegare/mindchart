import { SearchResultItemSchemaModel } from "@repo/zod-schemas";
import { NoteResult } from "./resultsItems/noteResult";
import { FC } from "react";
import { View } from "react-native";

interface SearchResultItemProps {
  query: string;
  data: SearchResultItemSchemaModel;
}

export const SearchResultItem: FC<SearchResultItemProps> = ({
  query,
  data,
}) => {
  return (
    <View className="mb-2">
      <NoteResult query={query} data={data} />
    </View>
  );
};
