import React, { useState } from "react";
import { ScrollView } from "react-native";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetOpenTrigger,
  BottomSheetView,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Button } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import { Input } from "@/components/ui/input";
import { SearchResultsList } from "../features/searchResults/components/searchResultsList";
import { useSearch } from "../hooks/useSearch";

export const SearchFeature = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { searchNotes } = useSearch(searchQuery);
  return (
    <BottomSheet>
      <BottomSheetOpenTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icon name="search" size={26} color="background" />
        </Button>
      </BottomSheetOpenTrigger>
      <BottomSheetContent
        snapPoints={["100%"]}
        style={{ zIndex: 100 }}
        enableDynamicSizing={false}
      >
        <BottomSheetView
          className="gap-5 pt-6 bg-background h-full"
          style={{ left: 19 }}
        >
          <BottomSheetHeader className="bg-background" closeButton={false}>
            <Input
              placeholder="Search"
              className="w-full mb-2"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </BottomSheetHeader>
          <ScrollView>
            <SearchResultsList query={searchQuery} data={searchNotes ?? []} />
          </ScrollView>
        </BottomSheetView>
      </BottomSheetContent>
    </BottomSheet>
  );
};
