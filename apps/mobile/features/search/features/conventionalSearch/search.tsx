import { Input } from "@/components/ui/input";
import { useEffect, useRef } from "react";
import { TextInput, View } from "react-native";
import { useSearchContext } from "../../context/search";
import { searchPlaceholder } from "@/features/search/searchLabels";

export const ConventionalSearch = ({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) => {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { queryInput, setQueryInput } = useSearchContext();

  const handleSearch = (t: string) => {
    setQueryInput(t);
    onSearch(t);
  };

  return (
    <View className="min-w-0 flex-1">
      <Input
        ref={inputRef}
        placeholder={String(searchPlaceholder())}
        className="w-full bg-card native:h-12 native:leading-tight"
        style={{ textAlignVertical: "center", paddingVertical: 8 }}
        value={queryInput}
        onChangeText={handleSearch}
      />
    </View>
  );
};
