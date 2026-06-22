import React from "react";
import { TouchableOpacity } from "react-native";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetOpenTrigger,
  BottomSheetView,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Button, Typography } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import { CategoryWithThoughtsInfos } from "@repo/zod-schemas/src/schemas";
import { useRouter } from "expo-router";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { View } from "react-native";

type CategoryBottomSheetProps = {
  category: CategoryWithThoughtsInfos;
};

export const CategoryBottomSheet = ({ category }: CategoryBottomSheetProps) => {
  const { push } = useRouter();
  const { dismiss } = useBottomSheetModal();

  const navigateToGraph = () => {
    dismiss();
    push({
      pathname: "/graph/[id]",
      params: {
        id: `category-${category.id}`,
        _t: Date.now(),
      },
    });
  };

  return (
    <BottomSheet>
      <BottomSheetOpenTrigger asChild className="w-fit">
        <TouchableOpacity className="rounded-full flex-row items-center gap-2 w-fit">
          <Icon name="ellipsis-vertical" color="text" size={20} />
        </TouchableOpacity>
      </BottomSheetOpenTrigger>
      <BottomSheetContent
        style={{ zIndex: 100 }}
        enablePanDownToClose={true}
        enableContentPanningGesture={false}
      >
        <BottomSheetView className="gap-3 pt-6 bg-background">
          <Button variant="outline" size="default" onPress={navigateToGraph}>
            <View className="flex-row items-center gap-2">
              <Icon name="graph" color="foreground" size={18} />
              <Typography variant="h3">View graph</Typography>
            </View>
          </Button>
        </BottomSheetView>
      </BottomSheetContent>
    </BottomSheet>
  );
};
