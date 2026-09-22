import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  AndroidSoftInputModes,
  KeyboardBackgroundView,
  KeyboardController,
  useGenericKeyboardHandler,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Switch } from "@/components/ui/switch";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icons/icon";
import type { IconName } from "@/components/ui/icons/icon-registry";
import { Portal } from "@/components/primitives/portal";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import type { ThoughtType } from "@repo/zod-schemas";
import {
  ThoughtsEditorTitlesToggleLabel,
  thoughtsEditorBoldAccessibilityLabel,
  thoughtsEditorItalicAccessibilityLabel,
  thoughtsEditorShowTitlesAccessibilityLabel,
  thoughtsEditorUnderlineAccessibilityLabel,
  thoughtsEditorBulletAccessibilityLabel,
  thoughtsEditorChecklistAccessibilityLabel,
  thoughtsEditorTextAccessibilityLabel,
} from "./thoughtsEditorLabels";

export const THOUGHTS_EDITOR_TOOLBAR_HEIGHT = 44;
const APPEAR_OPACITY_MS = 180;

type FormatCommand = "bold" | "italic" | "underline";

type ThoughtsEditorToolbarProps = {
  /** When true, the bar sits at the page bottom and snaps onto the keyboard. */
  dockToKeyboard?: boolean;
  showTitles: boolean;
  showTitlesToggle: boolean;
  onShowTitlesChange: (next: boolean) => void;
  activeFormats: Record<FormatCommand, boolean>;
  onFormat: (command: FormatCommand) => void;
  thoughtType: ThoughtType;
  onThoughtTypeChange: (type: ThoughtType) => void;
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
  thoughtType,
  onThoughtTypeChange,
}: Omit<ThoughtsEditorToolbarProps, "dockToKeyboard">) {
  const { colorScheme } = useColorScheme();

  return (
    <View
      className="flex-row items-center justify-between"
      style={styles.content}
    >
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
        <View
          style={{
            width: StyleSheet.hairlineWidth,
            height: 20,
            marginHorizontal: 4,
            backgroundColor: hsl("input", colorScheme),
          }}
        />
        <FormatButton
          icon="notebook-text"
          active={thoughtType === "text"}
          label={thoughtsEditorTextAccessibilityLabel()}
          onPress={() => onThoughtTypeChange("text")}
        />
        <FormatButton
          icon="list"
          active={thoughtType === "li"}
          label={thoughtsEditorBulletAccessibilityLabel()}
          onPress={() => onThoughtTypeChange("li")}
        />
        <FormatButton
          icon="square-check"
          active={thoughtType === "checkbox"}
          label={thoughtsEditorChecklistAccessibilityLabel()}
          onPress={() => onThoughtTypeChange("checkbox")}
        />
      </View>
      {showTitlesToggle ? (
        <View className="flex-row items-center gap-2">
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
  const keyboardHeight = useSharedValue(0);
  const isOpening = useSharedValue(false);
  const opacity = useSharedValue(1);
  const backgroundColor = hsl("footer", colorScheme);
  const borderColor = hsl("input", colorScheme);
  const bottomInset = insets.bottom;
  // KeyboardBackgroundView maps Gboard dark to #1c1c2c (navy). Use true black
  // in dark mode so the bar matches the keyboard instead of that blue-gray.
  const darkKeyboardFill = "#000000";

  React.useEffect(() => {
    if (!dockToKeyboard || Platform.OS !== "android") return;
    KeyboardController.setInputMode(
      AndroidSoftInputModes.SOFT_INPUT_ADJUST_NOTHING
    );
    return () => {
      KeyboardController.setDefaultMode();
    };
  }, [dockToKeyboard]);

  // Appear only after the IME has settled. Follow the keyboard down on close.
  useGenericKeyboardHandler(
    {
      onStart: (event) => {
        "worklet";
        const willOpen = event.progress === 1;
        if (willOpen && keyboardHeight.value <= 0) {
          isOpening.value = true;
          opacity.value = 0;
        } else if (!willOpen) {
          isOpening.value = false;
          if (keyboardHeight.value > 0) {
            opacity.value = 1;
          }
        }
      },
      onMove: (event) => {
        "worklet";
        if (!isOpening.value) {
          keyboardHeight.value = Math.max(0, event.height);
        }
      },
      onInteractive: (event) => {
        "worklet";
        isOpening.value = false;
        keyboardHeight.value = Math.max(0, event.height);
      },
      onEnd: (event) => {
        "worklet";
        isOpening.value = false;
        if (event.progress === 1) {
          keyboardHeight.value = Math.max(0, event.height);
          opacity.value = withTiming(1, {
            duration: APPEAR_OPACITY_MS,
            easing: Easing.out(Easing.quad),
          });
        } else {
          keyboardHeight.value = 0;
          opacity.value = 1;
        }
      },
    },
    []
  );

  const dockedStyle = useAnimatedStyle(() => {
    const keyboard = Math.max(0, keyboardHeight.value);
    const fill = Math.max(bottomInset, keyboard);
    const hidden = isOpening.value || opacity.value <= 0;
    return {
      height: THOUGHTS_EDITOR_TOOLBAR_HEIGHT + fill,
      opacity: opacity.value,
      pointerEvents: hidden ? "none" : "box-none",
    };
  }, [bottomInset]);

  const portalName = React.useId();
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
    <Portal name={`thoughts-editor-toolbar-${portalName}`}>
      <View pointerEvents="box-none" style={styles.screen}>
        <Animated.View
          pointerEvents="box-none"
          style={[styles.docked, dockedStyle, { borderTopColor: borderColor }]}
        >
          {colorScheme === "dark" ? (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: darkKeyboardFill },
              ]}
            />
          ) : (
            <KeyboardBackgroundView
              pointerEvents="none"
              style={StyleSheet.absoluteFill}
            />
          )}
          <View style={styles.dockedRow}>{content}</View>
        </Animated.View>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  inFlow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
  },
  screen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    elevation: 40,
  },
  docked: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dockedRow: {
    height: THOUGHTS_EDITOR_TOOLBAR_HEIGHT,
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 5,
  },
});
