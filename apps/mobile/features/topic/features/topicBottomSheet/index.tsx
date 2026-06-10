import React from "react";
import { TouchableOpacity, View } from "react-native";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetOpenTrigger,
  BottomSheetView,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Button, Typography } from "@/components/ui";
// import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { Icon } from "@/components/ui/icons/icon";
import { DeleteTopic } from "../deleteTopic";

export const TopicBottomSheet = ({ topicId }: { topicId: string }) => {
  // const { dismiss } = useBottomSheetModal();

  return (
    <>
      <BottomSheet>
        <BottomSheetOpenTrigger asChild className="w-fit">
          <TouchableOpacity className="rounded-full px-2 pw-1 flex-row items-center gap-2 w-fit">
            <Icon name="ellipsis-vertical" color="text" size={20} />
          </TouchableOpacity>
        </BottomSheetOpenTrigger>
        <BottomSheetContent
          style={{ zIndex: 100 }}
          enablePanDownToClose={true}
          enableContentPanningGesture={false}
        >
          <BottomSheetView className="gap-3 pt-6 bg-background">
            <Button
              variant="outline"
              size="default"
              onPress={() => console.log("edit topic")}
            >
              <View className="flex-row items-center gap-2">
                <Icon name="pencil" color="foreground" size={18} />
                <Typography variant="h3">Edit topic</Typography>
              </View>
            </Button>
            <DeleteTopic topicId={topicId} />
          </BottomSheetView>
        </BottomSheetContent>
      </BottomSheet>
    </>
  );
};

// function CategoryItem({ item, onPress, selected }: ItemProps) {
//   const { colorScheme } = useColorScheme();
//   return (
//     <Pressable
//       className="py-4 px-2 w-full rounded-lg border border-solid"
//       style={{
//         borderColor: selected ? hsl("border", colorScheme) : "transparent",
//       }}
//       onPress={onPress}
//     >
//       <View className="flex gap-2 items-center flex-row justify-between">
//         <View
//           className="w-4 h-4 rounded-full pr-4 pt-1"
//           style={{ backgroundColor: CATEGORIES_COLORS[item.id as CategoryKey] }}
//         ></View>
//         <View className="flex-1">
//           <Typography>{item.name}</Typography>
//         </View>
//         <View>{selected && <Check className="text-accent-foreground" />}</View>
//       </View>
//     </Pressable>
//   );
// }
