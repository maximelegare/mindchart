import React from "react";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
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
import { useIsFocused } from "@react-navigation/native";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icons/icon";
import type { IconName } from "@/components/ui/icons/icon-registry";
import { Portal } from "@/components/primitives/portal";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import type { ThoughtType } from "@repo/zod-schemas";
import {
  thoughtsEditorBoldAccessibilityLabel,
  thoughtsEditorItalicAccessibilityLabel,
  thoughtsEditorUnderlineAccessibilityLabel,
  thoughtsEditorBulletAccessibilityLabel,
  thoughtsEditorChecklistAccessibilityLabel,
  thoughtsEditorTextAccessibilityLabel,
  thoughtsEditorDetailsToolbarAccessibilityLabel,
  thoughtsEditorFormatToolbarAccessibilityLabel,
  thoughtsEditorTitleLabel,
  thoughtsEditorEditTitleAccessibilityLabel,
  thoughtsEditorNoTitleYet,
  thoughtsEditorCategoryAccessibilityLabel,
  thoughtsEditorGraphAccessibilityLabel,
} from "./thoughtsEditorLabels";

export const THOUGHTS_EDITOR_TOOLBAR_HEIGHT = 44;
export const THOUGHTS_EDITOR_TOOLBAR_TOGGLE_SIZE = 40;
const APPEAR_OPACITY_MS = 180;

export type ThoughtsToolbarMode = "format" | "details";

type FormatCommand = "bold" | "italic" | "underline";

type ThoughtsEditorToolbarProps = {
  /** When true, the bar sits at the page bottom and snaps onto the keyboard. */
  dockToKeyboard?: boolean;
  mode: ThoughtsToolbarMode;
  onModeChange: (mode: ThoughtsToolbarMode) => void;
  activeFormats: Record<FormatCommand, boolean>;
  onFormat: (command: FormatCommand) => void;
  thoughtType: ThoughtType;
  onThoughtTypeChange: (type: ThoughtType) => void;
  selectedTitle: string;
  selectedCategoryLabel: string;
  selectedCategoryColor: string | null;
  hasSelectedThought: boolean;
  titleReadOnly: boolean;
  onTitleChange: (title: string) => void;
  onTitleFocus: () => void;
  onOpenCategory: () => void;
  onOpenGraph: () => void;
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

function FormatToolbar({
  activeFormats,
  onFormat,
  thoughtType,
  onThoughtTypeChange,
}: Pick<
  ThoughtsEditorToolbarProps,
  "activeFormats" | "onFormat" | "thoughtType" | "onThoughtTypeChange"
>) {
  const { colorScheme } = useColorScheme();

  return (
    <View className="flex-row items-center" style={styles.content}>
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
  );
}

function DetailsToolbar({
  selectedTitle,
  selectedCategoryLabel,
  selectedCategoryColor,
  hasSelectedThought,
  titleReadOnly,
  onTitleChange,
  onTitleFocus,
  onOpenCategory,
  onOpenGraph,
}: Pick<
  ThoughtsEditorToolbarProps,
  | "selectedTitle"
  | "selectedCategoryLabel"
  | "selectedCategoryColor"
  | "hasSelectedThought"
  | "titleReadOnly"
  | "onTitleChange"
  | "onTitleFocus"
  | "onOpenCategory"
  | "onOpenGraph"
>) {
  const { colorScheme } = useColorScheme();
  const placeholder = thoughtsEditorNoTitleYet();
  const titleLabel = thoughtsEditorTitleLabel();
  const inputRef = React.useRef<TextInput>(null);
  const pendingFocusRef = React.useRef(false);
  const titleFieldBackground = hsl("muted", colorScheme).replace(
    /^hsl\((.+)\)$/,
    "hsla($1, 0.35)"
  );

  React.useEffect(() => {
    if (titleReadOnly || !pendingFocusRef.current) return;
    pendingFocusRef.current = false;
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 80);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [titleReadOnly]);

  return (
    <View className="flex-row items-center gap-4" style={styles.detailsContent}>
      <View
        className="min-w-0 flex-1 flex-row items-center"
        style={[styles.titleField, { backgroundColor: titleFieldBackground }]}
      >
        <View className="min-w-0 flex-1 justify-center">
          <Typography
            className="text-xs text-muted-foreground"
            numberOfLines={1}
          >
            {titleLabel}
          </Typography>
          {titleReadOnly ? (
            <Typography
              className="text-sm"
              numberOfLines={1}
              style={
                selectedTitle
                  ? undefined
                  : { color: hsl("muted-foreground", colorScheme) }
              }
            >
              {selectedTitle || placeholder}
            </Typography>
          ) : (
            <TextInput
              ref={inputRef}
              value={selectedTitle}
              onChangeText={onTitleChange}
              editable={hasSelectedThought}
              onFocus={onTitleFocus}
              placeholder={placeholder}
              placeholderTextColor={hsl("muted-foreground", colorScheme)}
              style={[
                styles.titleInput,
                {
                  color: hsl("foreground", colorScheme),
                },
              ]}
            />
          )}
        </View>
        {titleReadOnly ? (
          <Pressable
            onPress={() => {
              pendingFocusRef.current = true;
              onTitleFocus();
            }}
            disabled={!hasSelectedThought}
            accessibilityRole="button"
            accessibilityLabel={thoughtsEditorEditTitleAccessibilityLabel()}
            className="w-8 items-center justify-center self-center"
            style={{ opacity: hasSelectedThought ? 1 : 0.5 }}
          >
            <Icon name="pencil" size={16} color="foreground" />
          </Pressable>
        ) : null}
      </View>
      <Pressable
        onPress={onOpenCategory}
        disabled={!hasSelectedThought}
        accessibilityRole="button"
        accessibilityLabel={thoughtsEditorCategoryAccessibilityLabel()}
        className="h-10 flex-row items-center gap-1.5 px-1"
        style={{ opacity: hasSelectedThought ? 1 : 0.5 }}
      >
        <View
          className="h-3 w-3 rounded-full"
          style={{
            backgroundColor: selectedCategoryColor ?? hsl("muted", colorScheme),
          }}
        />
        <Typography
          className="text-sm"
          numberOfLines={1}
          style={{ maxWidth: 72 }}
        >
          {selectedCategoryLabel}
        </Typography>
        <Icon name="chevron-down" size={16} color="muted-foreground" />
      </Pressable>
      <Pressable
        onPress={onOpenGraph}
        disabled={!hasSelectedThought}
        accessibilityRole="button"
        accessibilityLabel={thoughtsEditorGraphAccessibilityLabel()}
        className="h-10 w-10 items-center justify-center rounded-md"
        style={{
          opacity: hasSelectedThought ? 1 : 0.5,
        }}
      >
        <Icon name="graph" size={20} color="foreground" />
      </Pressable>
    </View>
  );
}

function ToolbarToggle({
  mode,
  onModeChange,
}: Pick<ThoughtsEditorToolbarProps, "mode" | "onModeChange">) {
  const { colorScheme } = useColorScheme();
  const nextMode: ThoughtsToolbarMode =
    mode === "format" ? "details" : "format";
  const label =
    nextMode === "details"
      ? thoughtsEditorDetailsToolbarAccessibilityLabel()
      : thoughtsEditorFormatToolbarAccessibilityLabel();

  return (
    <Pressable
      onPress={() => onModeChange(nextMode)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.toggle,
        {
          backgroundColor: hsl("card", colorScheme),
          borderColor: hsl("input", colorScheme),
        },
      ]}
    >
      <Icon
        name={nextMode === "details" ? "tag" : "bold"}
        size={18}
        color="foreground"
      />
    </Pressable>
  );
}

function ToolbarContent(
  props: Omit<ThoughtsEditorToolbarProps, "dockToKeyboard">
) {
  return props.mode === "details" ? (
    <DetailsToolbar {...props} />
  ) : (
    <FormatToolbar {...props} />
  );
}

export function ThoughtsEditorToolbar({
  dockToKeyboard = false,
  ...contentProps
}: ThoughtsEditorToolbarProps) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { colorScheme } = useColorScheme();
  const keyboardHeight = useSharedValue(0);
  const isOpening = useSharedValue(false);
  const opacity = useSharedValue(1);
  const backgroundColor = hsl("footer", colorScheme);
  const borderColor = hsl("input", colorScheme);
  const bottomInset = insets.bottom;
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
  const toggle = (
    <ToolbarToggle
      mode={contentProps.mode}
      onModeChange={contentProps.onModeChange}
    />
  );

  if (!dockToKeyboard) {
    return (
      <View style={{ overflow: "visible", zIndex: 20, elevation: 20 }}>
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
        {toggle}
      </View>
    );
  }

  if (!isFocused) {
    return null;
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
          {toggle}
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
    overflow: "visible",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dockedRow: {
    height: THOUGHTS_EDITOR_TOOLBAR_HEIGHT,
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 5,
    paddingRight: 56,
  },
  detailsContent: {
    paddingHorizontal: 10,
    paddingRight: 56,
    paddingVertical: 2,
    flex: 1,
  },
  titleField: {
    minHeight: 36,
    borderRadius: 8,
    paddingVertical: 2,
    paddingLeft: 8,
    paddingRight: 2,
  },
  titleInput: {
    height: 18,
    padding: 0,
    margin: 0,
    fontSize: 15,
  },
  toggle: {
    position: "absolute",
    right: 12,
    top: -THOUGHTS_EDITOR_TOOLBAR_TOGGLE_SIZE / 2,
    zIndex: 50,
    width: THOUGHTS_EDITOR_TOOLBAR_TOGGLE_SIZE,
    height: THOUGHTS_EDITOR_TOOLBAR_TOGGLE_SIZE,
    borderRadius: THOUGHTS_EDITOR_TOOLBAR_TOGGLE_SIZE / 2,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
