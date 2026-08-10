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
  label: string;
  /** Trailing value (e.g. "Local") when not using subtitle/status stack. */
  value?: string;
  /** Small line under the label (model / workspace name). */
  subtitle?: string;
  /** Status line under the subtitle (Loaded / Setup / Enabled). */
  status?: string;
  /** Force red chevron (e.g. Recovery Password). */
  dangerChevron?: boolean;
  sheetTitle: string;
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
  dangerChevron = false,
  sheetTitle,
  borderBottom = true,
  children,
  className,
  surface,
}: SettingsSheetRowProps) {
  const { colorScheme } = useColorScheme();
  const showMeta = subtitle != null || status != null;
  const needsSetup = !!status && status !== "Loaded" && /setup/i.test(status);
  const isDisabledStatus = status === "Disabled";
  const attention = needsSetup || isDisabledStatus;
  const dangerColor = hsl(
    colorScheme === "dark" ? "destructive" : "destructive-foreground",
    colorScheme
  );
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
                        : status === "Loaded"
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
                    ? colorScheme === "dark"
                      ? "destructive"
                      : "destructive-foreground"
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
        snapPoints={["88%"]}
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
