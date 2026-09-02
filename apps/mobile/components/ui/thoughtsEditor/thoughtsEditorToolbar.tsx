import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { interpolate, useAnimatedStyle } from "react-native-reanimated";
import {
  KeyboardStickyView,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Switch } from "@/components/ui/switch";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icons/icon";
import type { IconName } from "@/components/ui/icons/icon-registry";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import {
  ThoughtsEditorTitlesToggleLabel,
  thoughtsEditorBoldAccessibilityLabel,
  thoughtsEditorItalicAccessibilityLabel,
  thoughtsEditorShowTitlesAccessibilityLabel,
  thoughtsEditorUnderlineAccessibilityLabel,
} from "./thoughtsEditorLabels";

export const THOUGHTS_EDITOR_TOOLBAR_HEIGHT = 44;
const OPEN_PAD = 6;

type FormatCommand = "bold" | "italic" | "underline";

type ThoughtsEditorToolbarProps = {
  /** When true, the bar sits at the page bottom and rides the keyboard. */
  dockToKeyboard?: boolean;
  showTitles: boolean;
  showTitlesToggle: boolean;
  onShowTitlesChange: (next: boolean) => void;
  activeFormats: Record<FormatCommand, boolean>;
  onFormat: (command: FormatCommand) => void;
};

function FormatButton({
  icon,
  active,
  label,
  onPress,
}: {
  icon: IconName;
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  const { colorScheme } = useColorScheme();
  return (
    <Pressable
      onPressIn={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      className="h-10 w-10 items-center justify-center rounded-md"
      style={
        active ? { backgroundColor: hsl("border", colorScheme) } : undefined
      }
    >
      <Icon name={icon} size={20} color={active ? "primary" : "foreground"} />
    </Pressable>
  );
}

function ToolbarContent({
  showTitles,
  showTitlesToggle,
  onShowTitlesChange,
  activeFormats,
  onFormat,
}: Omit<ThoughtsEditorToolbarProps, "dockToKeyboard">) {
  const { colorScheme } = useColorScheme();

  return (
    <View className="flex-row items-center justify-between px-2">
      <View className="flex-row items-center">
        <FormatButton
          icon="bold"
          active={activeFormats.bold}
          label={thoughtsEditorBoldAccessibilityLabel()}
          onPress={() => onFormat("bold")}
        />
        <FormatButton
          icon="italic"
          active={activeFormats.italic}
          label={thoughtsEditorItalicAccessibilityLabel()}
          onPress={() => onFormat("italic")}
        />
        <FormatButton
          icon="underline"
          active={activeFormats.underline}
          label={thoughtsEditorUnderlineAccessibilityLabel()}
          onPress={() => onFormat("underline")}
        />
      </View>
      {showTitlesToggle ? (
        <View className="flex-row items-center gap-2 pr-1">
          <Typography className="text-sm text-muted-foreground">
            <ThoughtsEditorTitlesToggleLabel />
          </Typography>
          <Switch
            checked={showTitles}
            onCheckedChange={onShowTitlesChange}
            aria-label={thoughtsEditorShowTitlesAccessibilityLabel()}
            trackColor={hsl("border", colorScheme)}
            trackCheckedColor={hsl("primary", colorScheme)}
            thumbColor={hsl("card", colorScheme)}
          />
        </View>
      ) : (
        <View />
      )}
    </View>
  );
}

export function ThoughtsEditorToolbar({
  dockToKeyboard = false,
  ...contentProps
}: ThoughtsEditorToolbarProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const { progress } = useReanimatedKeyboardAnimation();
  const backgroundColor = hsl("muted", colorScheme);
  const borderColor = hsl("input", colorScheme);

  const safePadStyle = useAnimatedStyle(() => ({
    paddingBottom: interpolate(
      progress.value,
      [0, 1],
      [Math.max(insets.bottom, OPEN_PAD), OPEN_PAD]
    ),
  }));

  const content = <ToolbarContent {...contentProps} />;

  if (!dockToKeyboard) {
    return (
      <View
        style={[
          styles.inFlow,
          {
            height: THOUGHTS_EDITOR_TOOLBAR_HEIGHT,
            backgroundColor,
            borderTopColor: borderColor,
          },
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <KeyboardStickyView
      pointerEvents="box-none"
      offset={{ closed: 0, opened: 0 }}
      style={[
        styles.docked,
        safePadStyle,
        {
          backgroundColor,
          borderTopColor: borderColor,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View style={styles.dockedRow}>{content}</View>
    </KeyboardStickyView>
  );
}

const styles = StyleSheet.create({
  inFlow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
  },
  docked: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    elevation: 20,
  },
  dockedRow: {
    height: THOUGHTS_EDITOR_TOOLBAR_HEIGHT,
    justifyContent: "center",
  },
});
