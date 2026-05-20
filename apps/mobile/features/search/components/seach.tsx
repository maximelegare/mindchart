import React from "react";
import { ScrollView, View } from "react-native";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetOpenTrigger,
  BottomSheetView,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Button, Typography } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";

export const Search = () => {
  return (
    <BottomSheet>
      <BottomSheetOpenTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icon name="search" size={26} color="background" />
        </Button>
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
              Categories
            </Typography>
          </BottomSheetHeader>
          <ScrollView>
            <View className="flex flex-col w-full flex-wrap gap-2"></View>
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
