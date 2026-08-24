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

type SettingsSheetRowProps = {
  label: React.ReactNode;
  /** Trailing value (e.g. "Local") when not using subtitle/status stack. */
  value?: React.ReactNode;
  /** Small line under the label (model / workspace name). */
  subtitle?: React.ReactNode;
  /** Status line under the subtitle (Loaded / Setup / Enabled). */
  status?: React.ReactNode;
  /** Controls status styling without relying on English status text. */
  statusTone?: "default" | "success" | "warning";
  /** Force red chevron (e.g. Recovery passphrase). */
  dangerChevron?: boolean;
  sheetTitle: React.ReactNode;
  /** Sheet height snap points. Defaults to 88%. */
  snapPoints?: Array<string | number>;
  borderBottom?: boolean;
  children: React.ReactNode;
  /** Injected by `List` for first/last row rounding. */
  className?: string;
  /** Injected by plain `List`. */
  surface?: "card" | "none";
};

/** List row that opens a bottom sheet. Pass sheet body as children (already wired with props). */
export function SettingsSheetRow({
  label,
  value,
  subtitle,
  status,
  statusTone = "default",
  dangerChevron = false,
  sheetTitle,
  snapPoints = ["88%"],
  borderBottom = true,
  children,
  className,
  surface,
}: SettingsSheetRowProps) {
  const { colorScheme } = useColorScheme();
  const showMeta = subtitle != null || status != null;
  const attention = statusTone === "warning";
  const success = statusTone === "success";
  const dangerColor = hsl("foreground-errors", colorScheme);
  const redChevron = dangerChevron || attention;

  return (
    <BottomSheet>
      <BottomSheetOpenTrigger asChild>
        <ListItem
          className={className}
          surface={surface}
          label={label}
          borderBottom={borderBottom}
          noChevron
          description={
            showMeta ? (
              <View className="gap-0.5 mt-0.5">
                {subtitle ? (
                  <Typography
                    variant="small"
                    style={{ color: hsl("muted-foreground", colorScheme) }}
                  >
                    {subtitle}
                  </Typography>
                ) : null}
                {status ? (
                  <Typography
                    variant="small"
                    style={{
                      color: attention
                        ? dangerColor
                        : success
                          ? hsl("primary", colorScheme)
                          : hsl("muted-foreground", colorScheme),
                    }}
                  >
                    {status}
                  </Typography>
                ) : null}
              </View>
            ) : undefined
          }
          itemRight={() => (
            <View className="flex-row items-center gap-1.5">
              {!showMeta && value ? (
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
              <Icon
                name="chevron-right"
                color={
                  redChevron
                    ? "foreground-errors"
                    : showMeta
                      ? "primary"
                      : "muted-foreground"
                }
                size={20}
              />
            </View>
          )}
        />
      </BottomSheetOpenTrigger>
      <BottomSheetContent
        enableDynamicSizing={false}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: hsl("background", colorScheme) }}
      >
        <BottomSheetHeader className="bg-background">
          <Typography variant="h3" padding={false}>
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
