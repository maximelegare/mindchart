import React from "react";
import { View } from "react-native";
import ListItem from "@/components/ui/list-item";
import { Typography } from "@/components/ui/typography";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetOpenTrigger,
  BottomSheetScrollView,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { Icon } from "@/components/ui/icons/icon";
import type { IconName } from "@/components/ui/icons/icon-registry";
import { ChevronRight } from "@/components/Icons";

type SettingsSheetRowProps = {
  label: string;
  value?: string;
  icon?: IconName;
  sheetTitle: string;
  borderBottom?: boolean;
  children: React.ReactNode;
  /** Injected by `List` for first/last row rounding. */
  className?: string;
};

/** List row that opens a bottom sheet. Pass sheet body as children (already wired with props). */
export function SettingsSheetRow({
  label,
  value,
  icon,
  sheetTitle,
  borderBottom = true,
  children,
  className,
}: SettingsSheetRowProps) {
  const { colorScheme } = useColorScheme();

  return (
    <BottomSheet>
      <BottomSheetOpenTrigger asChild>
        <ListItem
          className={className}
          label={label}
          borderBottom={borderBottom}
          noChevron
          itemLeft={
            icon
              ? () => <Icon name={icon} color="foreground" size={20} />
              : undefined
          }
          itemRight={() => (
            <View className="flex-row items-center gap-1.5">
              {value ? (
                <Typography
                  variant="p"
                  style={{
                    fontSize: 14,
                    color: hsl("muted-foreground", colorScheme),
                  }}
                >
                  {value}
                </Typography>
              ) : null}
              <ChevronRight className="size-5 opacity-70" />
            </View>
          )}
        />
      </BottomSheetOpenTrigger>
      <BottomSheetContent
        enableDynamicSizing={false}
        snapPoints={["88%"]}
        backgroundStyle={{ backgroundColor: hsl("background", colorScheme) }}
      >
        <BottomSheetHeader className="bg-background">
          <Typography className="text-foreground text-xl font-bold pb-1">
            {sheetTitle}
          </Typography>
        </BottomSheetHeader>
        <BottomSheetScrollView
          className="bg-background px-4"
          contentContainerStyle={{ paddingBottom: 40, gap: 8 }}
        >
          {children}
        </BottomSheetScrollView>
      </BottomSheetContent>
    </BottomSheet>
  );
}
