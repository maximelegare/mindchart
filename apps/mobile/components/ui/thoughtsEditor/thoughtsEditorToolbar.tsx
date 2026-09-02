import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import {
  AndroidSoftInputModes,
  KeyboardController,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Switch } from "@/components/ui/switch";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icons/icon";
import type { IconName } from "@/components/ui/icons/icon-registry";
import { gutter } from "@/components/ui/gutter";
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
const PAGE_SHEET_INSET = gutter("sm").marginLeft ?? 4;

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
  const { height } = useReanimatedKeyboardAnimation();
  const backgroundColor = hsl("footer", colorScheme);
  const borderColor = hsl("input", colorScheme);
  const bottomInset = insets.bottom;

  React.useEffect(() => {
    if (!dockToKeyboard || Platform.OS !== "android") return;
    KeyboardController.setInputMode(
      AndroidSoftInputModes.SOFT_INPUT_ADJUST_NOTHING
    );
    return () => {
      KeyboardController.setDefaultMode();
    };
  }, [dockToKeyboard]);

  const dockedStyle = useAnimatedStyle(() => {
    const keyboard = Math.max(0, -height.value);
    const tuckedInset = Math.min(bottomInset, keyboard);
    return {
      transform: [{ translateY: height.value + tuckedInset }],
    };
  }, [bottomInset]);

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
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.docked,
        dockedStyle,
        {
          left: -PAGE_SHEET_INSET,
          right: -PAGE_SHEET_INSET,
          paddingBottom: bottomInset,
          backgroundColor,
          borderTopColor: borderColor,
        },
      ]}
    >
      <View style={styles.dockedRow}>{content}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  inFlow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
  },
  docked: {
    position: "absolute",
    bottom: 0,
    zIndex: 20,
    elevation: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dockedRow: {
    height: THOUGHTS_EDITOR_TOOLBAR_HEIGHT,
    justifyContent: "center",
  },
});
