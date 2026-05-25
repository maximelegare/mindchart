import { Input } from "@/components/ui/input";
import { useEffect, useRef } from "react";
import { TextInput, View } from "react-native";
import { useSearchContext } from "../../context/search";

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
    <View className="flex-1 w-full">
      <Input
        ref={inputRef}
        placeholder="Search"
        className="w-full mb-2 bg-card"
        value={queryInput}
        onChangeText={handleSearch}
      />
    </View>
  );
};
