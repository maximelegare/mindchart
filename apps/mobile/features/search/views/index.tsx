import React from "react";
import { View } from "react-native";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetOpenTrigger,
  BottomSheetScrollView,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Button } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import { SearchResultsList } from "../features/searchResults/components/searchResultsList";
import { useSearch } from "../hooks/useSearch";
import { ConventionalSearch } from "../features/conventionalSearch/search";
import { useSearchContext } from "../context/search";

export const SearchFeature = () => {
  const { query, setQuery } = useSearchContext();
  const { searchNotes } = useSearch(query);

  return (
    <BottomSheet>
      <BottomSheetOpenTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icon name="search" size={24} color="popover-foreground" />
        </Button>
      </BottomSheetOpenTrigger>
      <BottomSheetContent
        snapPoints={["100%"]}
        style={{ zIndex: 100 }}
        enableDynamicSizing={false}
        enableContentPanningGesture={false}
      >
        <View className="gap-5 pt-6 bg-background">
          <BottomSheetHeader
            className="bg-background w-full px-4"
            closeButton={false}
          >
            <ConventionalSearch onSearch={setQuery} />
          </BottomSheetHeader>
        </View>
        <BottomSheetScrollView className="flex-1 bg-background px-4">
          <SearchResultsList query={query} data={searchNotes ?? []} />
        </BottomSheetScrollView>
      </BottomSheetContent>
    </BottomSheet>
  );
};
