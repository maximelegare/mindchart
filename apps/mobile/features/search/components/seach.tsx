import React from "react";
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
import {
  SearchResults as SearchResultsType,
  SearchResultsList,
} from "../features/searchResults/components/searchResultsList";

const searchResults: SearchResultsType = {
  results: [
    {
      type: "notes",
      name: "Notes",
      results: [
        {
          id: "1",
          title: "Note 1",
          summary: "Summary 1",
          semanticLabel: "Semantic Label 1",
          noteId: "1",
          categoryId: "1",
          thoughtId: "1",
          createdAt: "2021-01-01",
          topicName: "Topic 1",
        },
        {
          id: "2",
          title: "Note 2",
          summary: "Summary 2",
          semanticLabel: "Semantic Label 2",
          noteId: "2",
          categoryId: "2",
          thoughtId: "2",
          createdAt: "2021-01-02",
          topicName: "Topic 2",
        },
      ],
    },
    {
      type: "thoughts",
      name: "Thoughts",
      results: [
        {
          id: "1",
          title: "this is a title",
          summary:
            "this is a summary of the thought this is a summary of the thought",
          semanticLabel: "Semantic Label 1",
          noteId: "1",
          categoryId: "1",
          thoughtId: "1",
          createdAt: "2021-01-01",
          topicName: "Topic 1",
        },
      ],
    },
  ],
};

export const Search = () => {
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
            <Input placeholder="Search" className="w-full mb-2" />
          </BottomSheetHeader>
          <ScrollView>
            <SearchResultsList results={searchResults.results} />
          </ScrollView>
        </BottomSheetView>
      </BottomSheetContent>
    </BottomSheet>
  );
};

// function ThemeItem({item, onPress, selected}: ItemProps) {
//     return (
//       <Pressable className="py-4" onPress={onPress}>
//         <View className="flex bg-pink flex-row justify-between">
//           <View className="pr-4 pt-1">{item.icon}</View>
//           <View className="flex-1">
//             <H4>{item.title}</H4>
//             <Typography className="text-sm text-muted-foreground">{item.subtitle}</Typography>
//           </View>
//           <View>{selected && <Check className="text-accent-foreground" />}</View>
//         </View>
//       </Pressable>
//     );
//   }
