import { NoteResult } from "./resultsItems/noteResult";
import { FC } from "react";
import { View } from "react-native";
import { GroupedNoteResult } from "../../searchOptions/groupByNote/groupByNote";

interface SearchResultItemProps {
  query: string;
  data: GroupedNoteResult;
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
