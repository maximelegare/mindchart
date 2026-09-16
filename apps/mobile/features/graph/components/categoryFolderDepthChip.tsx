import React, { useState } from "react";
import { Pressable, View } from "react-native";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import { Check } from "@/lib/icons/Check";
import { cn } from "@/lib/cn";
import { hsl } from "@/utils/hsl";
import { useColorScheme } from "@/lib/useColorScheme";
import { useGraphStore } from "../context/graphContext";
import type { CategoryFolderMergeDepth } from "../types/types";
import {
  GraphCategoryFolderDepthOneLevelLabel,
  GraphCategoryFolderDepthThreeLevelsLabel,
  GraphCategoryFolderDepthTwoLevelsLabel,
  graphCategoryFolderDepthMenuAccessibilityLabel,
} from "./graphModeLabels";

const OPTIONS: {
  depth: CategoryFolderMergeDepth;
  Label: () => React.ReactNode;
}[] = [
  { depth: 1, Label: GraphCategoryFolderDepthOneLevelLabel },
  { depth: 2, Label: GraphCategoryFolderDepthTwoLevelsLabel },
  { depth: 3, Label: GraphCategoryFolderDepthThreeLevelsLabel },
];

export const CategoryFolderDepthMenu = () => {
  const [open, setOpen] = useState(false);
  const { colorScheme } = useColorScheme();
  const depth = useGraphStore((state) => state.categoryFolderMergeDepth);
  const setDepth = useGraphStore((state) => state.setCategoryFolderMergeDepth);
  const backgroundColor = hsl("background", colorScheme);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={graphCategoryFolderDepthMenuAccessibilityLabel(
            depth
          )}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            height: 38,
            paddingHorizontal: 10,
            borderRadius: 22,
            backgroundColor,
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
          }}
        >
          <Icon name="layers" color="text" size={16} />
          <Typography
            variant="span"
            style={{
              fontSize: 14,
              lineHeight: 16,
              includeFontPadding: false,
              fontFamily: "QuicksandBold",
            }}
          >
            {depth}
          </Typography>
        </Pressable>
      </DropdownMenuTrigger>

      {open ? (
        <DropdownMenuContent
          forceMount
          side="bottom"
          align="start"
          className="min-w-[9rem] mt-1 rounded-2xl border border-border bg-popover pb-1"
        >
          <DropdownMenuGroup>
            {OPTIONS.map(({ depth: optionDepth, Label }) => {
              const selected = optionDepth === depth;
              return (
                <DropdownMenuItem
                  key={optionDepth}
                  className={cn(
                    "px-3 flex-row items-center justify-between gap-3",
                    selected && "bg-border"
                  )}
                  onPress={() => {
                    setDepth(optionDepth);
                    setOpen(false);
                  }}
                >
                  <Typography variant="h4">
                    <Label />
                  </Typography>
                  {selected ? <Check size={16} /> : null}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      ) : null}
    </DropdownMenu>
  );
};
