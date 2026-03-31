import React from "react";
import { Pressable, ScrollView, TouchableOpacity, View } from "react-native";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetOpenTrigger,
  BottomSheetView,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Typography } from "@/components/ui";
import { Check } from "@/lib/icons/Check";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { useColorScheme } from "@/lib/useColorScheme";
import { Topic } from "@repo/zod-schemas";
import { hsl } from "@/utils/hsl";
import { useControllers } from "@/api/controllers/useControllers";

export const TopicSelector = ({
  onSelect,
  selectedTopic,
}: {
  onSelect: (topic: Topic) => void;
  selectedTopic: Topic;
}) => {
  const { useFetchAllTopicsQuery } = useControllers().topics;
  const { data: topics } = useFetchAllTopicsQuery();

  const { dismiss } = useBottomSheetModal();
  const handleSelect = (topic: Topic) => {
    onSelect(topic);
    dismiss();
  };

  return (
    <>
      <BottomSheet>
        <BottomSheetOpenTrigger asChild className="w-fit">
          <TouchableOpacity className="flex-row items-center gap-2">
            <Typography
              variant="h4"
              className="text-foreground px-2 py-1 bg-card border border-input rounded-lg"
            >
              {selectedTopic?.name}
            </Typography>
          </TouchableOpacity>
        </BottomSheetOpenTrigger>
        <BottomSheetContent
          style={{ zIndex: 100 }}
          enablePanDownToClose={true}
          enableContentPanningGesture={false}
        >
          <BottomSheetView
            className="gap-5 pt-6 bg-background"
            style={{ left: 19 }}
          >
            <BottomSheetHeader className="bg-background">
              <Typography className="text-foreground text-xl font-bold  pb-1">
                Topics
              </Typography>
            </BottomSheetHeader>
            <ScrollView style={{ maxHeight: 300 }}>
              <View className="flex flex-col w-full flex-wrap gap-2">
                {topics?.map((topic) => (
                  <TopicItem
                    key={topic.id}
                    item={topic}
                    onPress={() => handleSelect(topic)}
                    selected={selectedTopic.id === topic.id}
                  />
                ))}
              </View>
            </ScrollView>
          </BottomSheetView>
        </BottomSheetContent>
      </BottomSheet>
    </>
  );
};

type ItemProps = {
  item: Topic;
  onPress: () => void;
  selected: boolean;
};

function TopicItem({ item, onPress, selected }: ItemProps) {
  const { colorScheme } = useColorScheme();
  return (
    <Pressable
      className="py-4 px-2 w-full rounded-lg border border-solid"
      style={{
        borderColor: selected ? hsl("border", colorScheme) : "transparent",
      }}
      onPress={onPress}
    >
      <View className="flex gap-2 items-center flex-row justify-between">
        <View className="flex-1">
          <Typography>{item.name}</Typography>
        </View>
        <View>{selected && <Check className="text-accent-foreground" />}</View>
      </View>
    </Pressable>
  );
}
