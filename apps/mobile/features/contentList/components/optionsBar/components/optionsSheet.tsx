import React from "react";
import { Pressable, View } from "react-native";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetView,
  useBottomSheet,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Typography } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import { IconName } from "@/components/ui/icons/icon-registry";
import { Check } from "@/lib/icons/Check";
import { cn } from "@/lib/cn";
import type { SortField } from "../../../types";
import { OptionChip } from "./options/optionChip";
import { TriggerFilterChip } from "./triggerFilterChip";
import type { OptionLabelRenderer } from "./optionsBarLabels";

export type OptionItem<T extends string> = {
  value: T;
  icon?: IconName;
};

export const SORT_FIELD_OPTIONS: OptionItem<SortField>[] = [
  { icon: "arrow-down-a-z", value: "alphabetical" },
  { icon: "eye", value: "lastViewed" },
  { icon: "pencil", value: "updatedAt" },
  { icon: "calendar", value: "createdAt" },
];

type OptionsPickerProps<T extends string> = {
  title: React.ReactNode;
  value: T;
  options: OptionItem<T>[];
  renderOptionLabel: OptionLabelRenderer<T>;
  renderChipLabel: (value: T) => React.ReactNode;
  onValueChange: (value: T) => void;
  largeChip?: boolean;
};

export function OptionsSheet<T extends string>({
  title,
  value,
  options,
  renderOptionLabel,
  renderChipLabel,
  onValueChange,
  largeChip = false,
}: OptionsPickerProps<T>) {
  const sheet = useBottomSheet();
  const selected = options.find((option) => option.value === value);
  const selectedIcon = selected?.icon;
  const Chip = largeChip ? TriggerFilterChip : OptionChip;

  return (
    <View className="shrink-0">
      <Chip
        icon={selectedIcon}
        label={renderChipLabel(value)}
        onPress={() => sheet.open()}
      />

      <BottomSheet
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          overflow: "hidden",
        }}
      >
        <BottomSheetContent
          ref={sheet.ref}
          style={{ zIndex: 200 }}
          enablePanDownToClose
          enableContentPanningGesture={false}
        >
          <BottomSheetView className="gap-2 bg-background pt-4">
            <BottomSheetHeader
              className="bg-background"
              onDismiss={() => sheet.close()}
            >
              <Typography variant="h3">{title}</Typography>
            </BottomSheetHeader>

            <View className="gap-1 pb-2">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    className={cn(
                      "w-full flex-row items-center justify-between gap-2 rounded-lg px-2 py-3",
                      isSelected && "bg-border"
                    )}
                    onPress={() => {
                      onValueChange(option.value);
                      sheet.close();
                    }}
                  >
                    <View className="min-w-0 flex-1 flex-row items-center gap-2">
                      {option.icon ? (
                        <Icon name={option.icon} color="foreground" size={18} />
                      ) : null}
                      <Typography variant="p" className="text-foreground">
                        {renderOptionLabel(option.value)}
                      </Typography>
                    </View>
                    {isSelected ? (
                      <Check className="text-accent-foreground" />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </BottomSheetView>
        </BottomSheetContent>
      </BottomSheet>
    </View>
  );
}
