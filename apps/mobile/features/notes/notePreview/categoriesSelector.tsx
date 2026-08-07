import { CategoryKey } from "@repo/sqlite";
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
import { Category } from "@repo/zod-schemas";
import { CATEGORIES_COLORS } from "@repo/theme/categories";
import { hsl } from "@/utils/hsl";
import { useColorScheme } from "@/lib/useColorScheme";

export const CategorySelector = ({
  categories,
  onSelect,
  selectedCategory,
  variant = "default",
}: {
  categories: Category[];
  onSelect: (category: Category) => void;
  selectedCategory: Category | null;
  variant?: "default" | "subtle";
}) => {
  const { dismiss } = useBottomSheetModal();
  const handleSelect = (category: Category) => {
    onSelect(category);
    dismiss();
  };

  const selectableCategories = categories.filter(
    (category) => category.id !== "people"
  );

  return (
    <>
      <BottomSheet>
        <BottomSheetOpenTrigger asChild className="w-fit">
          <TouchableOpacity
            className={
              variant === "subtle"
                ? "rounded-full px-1.5 py-0.5 flex-row items-center gap-1.5 w-fit opacity-60"
                : "rounded-full px-2 pw-1 flex-row items-center gap-2 bg-muted absolute w-fit"
            }
          >
            <View
              className={
                variant === "subtle"
                  ? "w-2.5 h-2.5 rounded-full"
                  : "w-4 h-4 rounded-full"
              }
              style={{
                backgroundColor:
                  CATEGORIES_COLORS[selectedCategory?.id as CategoryKey],
              }}
            ></View>
            <Typography
              variant={variant === "subtle" ? "p" : "h4"}
              className={
                variant === "subtle"
                  ? "text-muted-foreground text-xs"
                  : "text-foreground"
              }
            >
              {selectedCategory?.name}
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
                Categories
              </Typography>
            </BottomSheetHeader>
            <ScrollView style={{ maxHeight: 300 }}>
              <View className="flex flex-col w-full flex-wrap gap-2">
                {selectableCategories.map((category) => (
                  <CategoryItem
                    key={category.id}
                    item={category}
                    // Use handleSelect instead of onSelect to ensure close() is called
                    onPress={() => handleSelect(category)}
                    selected={selectedCategory === category}
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
  item: Category;
  onPress: () => void;
  selected: boolean;
};

function CategoryItem({ item, onPress, selected }: ItemProps) {
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
        <View
          className="w-4 h-4 rounded-full pr-4 pt-1"
          style={{ backgroundColor: CATEGORIES_COLORS[item.id as CategoryKey] }}
        ></View>
        <View className="flex-1">
          <Typography>{item.name}</Typography>
        </View>
        <View>{selected && <Check className="text-accent-foreground" />}</View>
      </View>
    </Pressable>
  );
}

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
