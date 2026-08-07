import React, { useMemo } from "react";
import { Pressable, TouchableOpacity, View } from "react-native";
import {
  BottomSheet,
  BottomSheetCloseTrigger,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetOpenTrigger,
  BottomSheetView,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Typography } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Check } from "@/lib/icons/Check";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { Icon } from "@/components/ui/icons/icon";
import { cn } from "@/lib/cn";
import { FEELINGS_DEFINITIONS } from "@repo/sqlite";
import type { FeelingValue } from "@repo/zod-schemas/src/schemas";

export const FeelingSelector = ({
  selectedFeeling,
  onChange,
}: {
  selectedFeeling: FeelingValue | null | undefined;
  onChange: (feeling: FeelingValue | null) => void;
}) => {
  const label = useMemo(() => {
    if (selectedFeeling == null) return "";
    return (
      FEELINGS_DEFINITIONS.find((feeling) => feeling.value === selectedFeeling)
        ?.label ?? "Feeling"
    );
  }, [selectedFeeling]);

  return (
    <BottomSheet>
      <BottomSheetOpenTrigger asChild className="self-start">
        <TouchableOpacity className="flex-row items-center gap-1.5 self-start rounded-full bg-card px-2.5 py-1.5">
          <Icon name="heart" color="foreground" size={16} />
          <Typography
            variant="p"
            className="shrink text-foreground"
            numberOfLines={1}
          >
            {label}
          </Typography>
          {selectedFeeling == null ? (
            <Icon name="plus" color="foreground" size={16} />
          ) : null}
        </TouchableOpacity>
      </BottomSheetOpenTrigger>
      <BottomSheetContent
        style={{ zIndex: 100 }}
        enablePanDownToClose
        enableContentPanningGesture={false}
        enableDynamicSizing={false}
        snapPoints={["100%"]}
      >
        <BottomSheetView className="h-full flex-1 gap-4 bg-background px-4 pb-6 pt-4">
          <BottomSheetHeader className="bg-background">
            <Typography variant="h3" className="pb-1 text-foreground">
              Feeling
            </Typography>
          </BottomSheetHeader>

          <View className="min-h-0 flex-1 gap-2">
            {FEELINGS_DEFINITIONS.map((feeling) => (
              <FeelingItem
                key={feeling.value}
                label={feeling.label}
                selected={selectedFeeling === feeling.value}
                onPress={() => onChange(feeling.value)}
              />
            ))}
            {selectedFeeling != null ? (
              <FeelingItem
                label="Clear"
                selected={false}
                onPress={() => onChange(null)}
              />
            ) : null}
          </View>

          <View className="items-center justify-center pt-2">
            <BottomSheetCloseTrigger asChild>
              <Button variant="ghost" className="bg-popover px-6">
                <Typography className="text-foreground">Close</Typography>
              </Button>
            </BottomSheetCloseTrigger>
          </View>
        </BottomSheetView>
      </BottomSheetContent>
    </BottomSheet>
  );
};

function FeelingItem({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { dismiss } = useBottomSheetModal();

  return (
    <Pressable
      className={cn("w-full rounded-lg px-2 py-4", selected && "bg-border")}
      onPress={() => {
        onPress();
        dismiss();
      }}
    >
      <View className="flex-row items-center justify-between gap-2">
        <Typography>{label}</Typography>
        {selected ? <Check className="text-accent-foreground" /> : null}
      </View>
    </Pressable>
  );
}
