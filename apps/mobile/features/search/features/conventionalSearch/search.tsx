import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { TextInput, View } from "react-native";

export const ConventionalSearch = ({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) => {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (t: string) => {
    setSearchQuery(t);
    onSearch(t);
  };

  return (
    <View className="flex-1 w-full">
      <Input
        ref={inputRef}
        placeholder="Search"
        className="w-full mb-2 bg-card"
        value={searchQuery}
        onChangeText={handleSearch}
      />
    </View>
  );
};
