import React from "react";
import { Pressable } from "react-native";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetView,
  useBottomSheet,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Typography } from "@/components/ui/typography";
import { Check } from "@/lib/icons/Check";
import { cn } from "@/lib/cn";
import { useOptionsBar } from "@/features/contentList/components/optionsBar/context/optionBarContext";
import { PAGE_SIZE_OPTIONS } from "../constants";
import { OptionChip } from "@/features/contentList/components/optionsBar/components/options/optionChip";

export const PageSizeChip = () => {
  const sheet = useBottomSheet();
  const pageSize = useOptionsBar((state) => state.pageSize);
  const setPageSize = useOptionsBar((state) => state.setPageSize);

  return (
    <>
      <OptionChip
        icon="list"
        label={`Limit: ${pageSize}`}
        onPress={() => sheet.open()}
      />

      <BottomSheet>
        <BottomSheetContent
          ref={sheet.ref}
          enablePanDownToClose
          enableContentPanningGesture={false}
        >
          <BottomSheetView className="gap-1 pt-4 bg-background">
            <BottomSheetHeader
              className="bg-background"
              onDismiss={() => sheet.close()}
            >
              <Typography variant="h3">Notes per page</Typography>
            </BottomSheetHeader>

            {PAGE_SIZE_OPTIONS.map((size) => {
              const selected = size === pageSize;
              return (
                <Pressable
                  key={size}
                  onPress={() => {
                    setPageSize(size);
                    sheet.close();
                  }}
                  className={cn(
                    "flex-row items-center justify-between rounded-xl px-4 py-3",
                    selected && "bg-border"
                  )}
                >
                  <Typography variant="h4">{size}</Typography>
                  {selected ? <Check size={18} /> : null}
                </Pressable>
              );
            })}
          </BottomSheetView>
        </BottomSheetContent>
      </BottomSheet>
    </>
  );
};
