import React from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
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
import { isHeadingType, type ThoughtType } from "@repo/zod-schemas";
import { thoughtCapabilities } from "./thoughtCapabilities";
import {
  thoughtsEditorBoldAccessibilityLabel,
  thoughtsEditorItalicAccessibilityLabel,
  thoughtsEditorUnderlineAccessibilityLabel,
  thoughtsEditorBulletAccessibilityLabel,
  thoughtsEditorChecklistAccessibilityLabel,
  thoughtsEditorTextAccessibilityLabel,
  thoughtsEditorDetailsToolbarAccessibilityLabel,
  thoughtsEditorFormatToolbarAccessibilityLabel,
  thoughtsEditorEditTitleAccessibilityLabel,
  thoughtsEditorNoTitleYet,
  thoughtsEditorNoThoughtSelected,
  thoughtsEditorCategoryUnavailable,
  thoughtsEditorCategoryAccessibilityLabel,
  thoughtsEditorGraphAccessibilityLabel,
  thoughtsEditorSplitAccessibilityLabel,
  thoughtsEditorSplitLeftAccessibilityLabel,
  thoughtsEditorSplitRightAccessibilityLabel,
  thoughtsEditorSplitCursorAccessibilityHint,
  thoughtsEditorSplitConfirmAccessibilityLabel,
  thoughtsEditorSplitCancelAccessibilityLabel,
  thoughtsEditorMergeAccessibilityLabel,
  thoughtsEditorMergeAccessibilityHint,
  thoughtsEditorMergeConfirmAccessibilityLabel,
  thoughtsEditorMergeCancelAccessibilityLabel,
  thoughtsEditorHideCategoriesAccessibilityLabel,
  thoughtsEditorShowCategoriesAccessibilityLabel,
  thoughtsEditorCategoryOpacityAccessibilityLabel,
  thoughtsEditorCategoryOpacityLabel,
  thoughtsEditorDetailsMoreOptionsAccessibilityLabel,
  thoughtsEditorDetailsTitleCategoryAccessibilityLabel,
  thoughtsEditorTextTypeLabel,
  thoughtsEditorBulletTypeLabel,
  thoughtsEditorChecklistTypeLabel,
  thoughtsEditorThoughtTypeMenuAccessibilityLabel,
  thoughtsEditorHeading1TypeLabel,
  thoughtsEditorHeading2TypeLabel,
  thoughtsEditorHeading3TypeLabel,
  thoughtsEditorHeading4TypeLabel,
  thoughtsEditorHeading5TypeLabel,
  thoughtsEditorHeading6TypeLabel,
} from "./thoughtsEditorLabels";

export const THOUGHTS_EDITOR_TOOLBAR_HEIGHT = 44;
export const THOUGHTS_EDITOR_DETAILS_TOOLBAR_HEIGHT = 44;
export const THOUGHTS_EDITOR_TOOLBAR_TOGGLE_SIZE = 40;
export const TOOLBAR_HEIGHT_ANIMATION_MS = 260;
const APPEAR_OPACITY_MS = 180;
const OPACITY_POPUP_WIDTH = 220;
const OPACITY_SLIDER_WIDTH = 196;
const TYPE_POPUP_WIDTH = 188;
const POPUP_IN_MS = 160;
const POPUP_OUT_MS = 120;
const HEIGHT_EASING = Easing.inOut(Easing.cubic);

export type ThoughtsToolbarMode = "format" | "details";

export function getThoughtsEditorToolbarHeight(mode: ThoughtsToolbarMode) {
  return mode === "details"
    ? THOUGHTS_EDITOR_DETAILS_TOOLBAR_HEIGHT
    : THOUGHTS_EDITOR_TOOLBAR_HEIGHT;
}

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
  onEditTitle: () => void;
  onOpenCategory: () => void;
  onOpenGraph: () => void;
  categoriesHidden: boolean;
  categoryOpacity: number;
  onToggleCategories: () => void;
  onCategoryOpacityChange: (opacity: number) => void;
  splitSide: "left" | "right" | null;
  splitCurrentColor?: string | null;
  splitNewColor?: string | null;
  onSplit: () => void;
  onSplitSide: (side: "left" | "right") => void;
  onConfirmSplit: () => void;
  onCancelSplit: () => void;
  merging: boolean;
  mergeCanConfirm: boolean;
  onMerge: () => void;
  onConfirmMerge: () => void;
  onCancelMerge: () => void;
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

const THOUGHT_TYPE_OPTIONS: Array<{
  type: ThoughtType;
  icon: IconName;
  label: () => string;
  accessibilityLabel: () => string;
}> = [
  {
    type: "text",
    icon: "text-align-start",
    label: thoughtsEditorTextTypeLabel,
    accessibilityLabel: thoughtsEditorTextAccessibilityLabel,
  },
  {
    type: "li",
    icon: "list",
    label: thoughtsEditorBulletTypeLabel,
    accessibilityLabel: thoughtsEditorBulletAccessibilityLabel,
  },
  {
    type: "checkbox",
    icon: "square-check",
    label: thoughtsEditorChecklistTypeLabel,
    accessibilityLabel: thoughtsEditorChecklistAccessibilityLabel,
  },
  {
    type: "h1",
    icon: "heading-1",
    label: thoughtsEditorHeading1TypeLabel,
    accessibilityLabel: thoughtsEditorHeading1TypeLabel,
  },
  {
    type: "h2",
    icon: "heading-2",
    label: thoughtsEditorHeading2TypeLabel,
    accessibilityLabel: thoughtsEditorHeading2TypeLabel,
  },
  {
    type: "h3",
    icon: "heading-3",
    label: thoughtsEditorHeading3TypeLabel,
    accessibilityLabel: thoughtsEditorHeading3TypeLabel,
  },
  {
    type: "h4",
    icon: "heading-4",
    label: thoughtsEditorHeading4TypeLabel,
    accessibilityLabel: thoughtsEditorHeading4TypeLabel,
  },
  {
    type: "h5",
    icon: "heading-5",
    label: thoughtsEditorHeading5TypeLabel,
    accessibilityLabel: thoughtsEditorHeading5TypeLabel,
  },
  {
    type: "h6",
    icon: "heading-6",
    label: thoughtsEditorHeading6TypeLabel,
    accessibilityLabel: thoughtsEditorHeading6TypeLabel,
  },
];

function ThoughtTypePopup({
  visible,
  anchor,
  thoughtType,
  onSelect,
  onClose,
  onExited,
}: {
  visible: boolean;
  anchor: { x: number; y: number; width: number };
  thoughtType: ThoughtType;
  onSelect: (type: ThoughtType) => void;
  onClose: () => void;
  onExited: () => void;
}) {
  const { colorScheme } = useColorScheme();
  const overlayRef = React.useRef<View>(null);
  const [overlay, setOverlay] = React.useState({
    x: 0,
    y: 0,
    height: 0,
    width: 0,
  });
  const progress = useSharedValue(0);
  const onExitedRef = React.useRef(onExited);
  onExitedRef.current = onExited;
  const popupWidth = Math.max(TYPE_POPUP_WIDTH, anchor.width);
  const overlayWidth = overlay.width || Dimensions.get("window").width;
  const maxPopupHeight = Math.max(
    160,
    (overlay.height ? anchor.y - overlay.y : Dimensions.get("window").height) -
      12
  );
  const left = Math.min(
    Math.max(0, anchor.x - overlay.x),
    Math.max(0, overlayWidth - popupWidth)
  );
  const bottom = Math.max(0, overlay.y + overlay.height - anchor.y + 4);

  const measureOverlay = () => {
    overlayRef.current?.measureInWindow((x, y, width, height) => {
      setOverlay({ x, y, width, height });
    });
  };

  React.useEffect(() => {
    if (visible) {
      progress.value = withTiming(1, {
        duration: POPUP_IN_MS,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    const finishExit = () => onExitedRef.current();
    progress.value = withTiming(
      0,
      { duration: POPUP_OUT_MS, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(finishExit)();
      }
    );
  }, [progress, visible]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 10 }],
  }));

  return (
    <Portal name="thoughts-editor-thought-type">
      <View
        ref={overlayRef}
        onLayout={measureOverlay}
        pointerEvents="box-none"
        style={styles.screen}
      >
        <Pressable
          accessibilityRole="button"
          onPress={visible ? onClose : undefined}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          style={[
            styles.typePopup,
            {
              left,
              bottom,
              width: popupWidth,
              maxHeight: maxPopupHeight,
              backgroundColor: hsl("popover", colorScheme),
              borderColor: hsl("border", colorScheme),
            },
            cardStyle,
            overlay.height ? undefined : { opacity: 0 },
          ]}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {THOUGHT_TYPE_OPTIONS.map((option) => {
              const selected = thoughtType === option.type;
              return (
                <Pressable
                  key={option.type}
                  onPress={() => {
                    onSelect(option.type);
                    onClose();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={option.accessibilityLabel()}
                  accessibilityState={{ selected }}
                  style={[
                    styles.typeOption,
                    selected
                      ? { backgroundColor: hsl("border", colorScheme) }
                      : undefined,
                  ]}
                >
                  <Icon
                    name={option.icon}
                    size={20}
                    color={selected ? "primary" : "foreground"}
                  />
                  <Typography className="text-base" numberOfLines={1}>
                    {option.label()}
                  </Typography>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </Portal>
  );
}

function FormatToolbar({
  activeFormats,
  onFormat,
  thoughtType,
  onThoughtTypeChange,
  enabled = true,
}: Pick<
  ThoughtsEditorToolbarProps,
  "activeFormats" | "onFormat" | "thoughtType" | "onThoughtTypeChange"
> & { enabled?: boolean }) {
  const { colorScheme } = useColorScheme();
  const typeRef = React.useRef<View>(null);
  const [typePopupAnchor, setTypePopupAnchor] = React.useState<{
    x: number;
    y: number;
    width: number;
  } | null>(null);
  const [typePopupVisible, setTypePopupVisible] = React.useState(false);
  const selectedType =
    THOUGHT_TYPE_OPTIONS.find((option) => option.type === thoughtType) ??
    THOUGHT_TYPE_OPTIONS[0];

  React.useEffect(() => {
    if (enabled) return;
    setTypePopupVisible(false);
  }, [enabled]);

  const openTypePopup = () => {
    typeRef.current?.measureInWindow((x, y, width) => {
      setTypePopupAnchor({ x, y, width });
      setTypePopupVisible(true);
    });
  };

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
      <Pressable
        ref={typeRef}
        onPress={
          typePopupVisible ? () => setTypePopupVisible(false) : openTypePopup
        }
        accessibilityRole="button"
        accessibilityLabel={thoughtsEditorThoughtTypeMenuAccessibilityLabel()}
        accessibilityState={{ expanded: typePopupVisible }}
        style={[
          styles.typeTrigger,
          typePopupVisible
            ? { backgroundColor: hsl("border", colorScheme) }
            : undefined,
        ]}
      >
        <Icon name={selectedType.icon} size={20} color="foreground" />
        <Typography className="text-base" numberOfLines={1}>
          {selectedType.label()}
        </Typography>
        <Icon
          name={typePopupVisible ? "chevron-up" : "chevron-down"}
          size={14}
          color="muted-foreground"
        />
      </Pressable>
      {typePopupAnchor ? (
        <ThoughtTypePopup
          visible={typePopupVisible}
          anchor={typePopupAnchor}
          thoughtType={thoughtType}
          onSelect={onThoughtTypeChange}
          onClose={() => setTypePopupVisible(false)}
          onExited={() => setTypePopupAnchor(null)}
        />
      ) : null}
    </View>
  );
}

function OpacitySlider({
  value,
  onValueChange,
}: {
  value: number;
  onValueChange: (value: number) => void;
}) {
  const { colorScheme } = useColorScheme();
  const trackXRef = React.useRef(0);
  const trackRef = React.useRef<View>(null);
  const clamped = Math.min(1, Math.max(0, value));
  const thumbSize = 16;
  const travel = OPACITY_SLIDER_WIDTH - thumbSize;

  const setFromPageX = (pageX: number) => {
    const next = (pageX - trackXRef.current - thumbSize / 2) / travel;
    onValueChange(Math.min(1, Math.max(0, next)));
  };

  return (
    <View
      ref={trackRef}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={thoughtsEditorCategoryOpacityAccessibilityLabel()}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      onLayout={() => {
        trackRef.current?.measureInWindow((x) => {
          trackXRef.current = x;
        });
      }}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(event) => setFromPageX(event.nativeEvent.pageX)}
      onResponderMove={(event) => setFromPageX(event.nativeEvent.pageX)}
      style={styles.opacitySliderSlot}
    >
      <View
        style={[
          styles.opacityTrack,
          { backgroundColor: hsl("input", colorScheme) },
        ]}
      >
        <View
          style={[
            styles.opacityFill,
            {
              width: `${clamped * 100}%`,
              backgroundColor: hsl("primary", colorScheme),
            },
          ]}
        />
      </View>
      <View
        pointerEvents="none"
        style={[
          styles.opacityThumb,
          {
            left: clamped * travel,
            backgroundColor: hsl("primary", colorScheme),
          },
        ]}
      />
    </View>
  );
}

function CategoryOpacityPopup({
  visible,
  anchor,
  opacity,
  onOpacityChange,
  onClose,
  onExited,
}: {
  visible: boolean;
  anchor: { x: number; y: number; width: number };
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  onClose: () => void;
  onExited: () => void;
}) {
  const { colorScheme } = useColorScheme();
  const window = Dimensions.get("window");
  const progress = useSharedValue(0);
  const onExitedRef = React.useRef(onExited);
  onExitedRef.current = onExited;
  const left = Math.min(
    Math.max(8, anchor.x + anchor.width / 2 - OPACITY_POPUP_WIDTH / 2),
    window.width - OPACITY_POPUP_WIDTH - 8
  );
  const bottom = Math.max(8, window.height - anchor.y + 8);

  React.useEffect(() => {
    if (visible) {
      progress.value = withTiming(1, {
        duration: POPUP_IN_MS,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    const finishExit = () => onExitedRef.current();
    progress.value = withTiming(
      0,
      { duration: POPUP_OUT_MS, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(finishExit)();
      }
    );
  }, [progress, visible]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 10 }],
  }));

  return (
    <Portal name="thoughts-editor-category-opacity">
      <View pointerEvents="box-none" style={styles.screen}>
        <Pressable
          accessibilityRole="button"
          onPress={visible ? onClose : undefined}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          style={[
            styles.opacityPopup,
            {
              left,
              bottom,
              backgroundColor: hsl("popover", colorScheme),
              borderColor: hsl("border", colorScheme),
            },
            cardStyle,
          ]}
        >
          <Typography
            className="text-xs text-muted-foreground"
            numberOfLines={1}
          >
            {thoughtsEditorCategoryOpacityLabel()}
          </Typography>
          <OpacitySlider value={opacity} onValueChange={onOpacityChange} />
        </Animated.View>
      </View>
    </Portal>
  );
}

function SplitColorSwatch({ color }: { color: string | null | undefined }) {
  const { colorScheme } = useColorScheme();
  return (
    <View
      style={{
        width: 10,
        height: 10,
        borderRadius: 2,
        backgroundColor: color ?? hsl("muted", colorScheme),
      }}
    />
  );
}

function SplitSessionToolbar({
  splitSide,
  selectedCategoryLabel,
  selectedCategoryColor,
  splitCurrentColor,
  splitNewColor,
  onConfirmSplit,
  onCancelSplit,
  onSplitSide,
  onOpenCategory,
}: {
  splitSide: "left" | "right";
  selectedCategoryLabel: string;
  selectedCategoryColor: string | null;
  splitCurrentColor?: string | null;
  splitNewColor?: string | null;
  onConfirmSplit: () => void;
  onCancelSplit: () => void;
  onSplitSide: (side: "left" | "right") => void;
  onOpenCategory: () => void;
}) {
  const { colorScheme } = useColorScheme();
  const chipBackground = hsl("muted", colorScheme).replace(
    /^hsl\((.+)\)$/,
    "hsla($1, 0.35)"
  );

  return (
    <View className="flex-row items-center" style={styles.splitSession}>
      <View style={styles.splitConfirmCluster}>
        <Pressable
          onPress={onConfirmSplit}
          accessibilityRole="button"
          accessibilityLabel={thoughtsEditorSplitConfirmAccessibilityLabel()}
          className="h-10 w-10 items-center justify-center rounded-md"
        >
          <Icon name="circle-check" size={28} color="primary" />
        </Pressable>
        <Pressable
          onPress={onCancelSplit}
          accessibilityRole="button"
          accessibilityLabel={thoughtsEditorSplitCancelAccessibilityLabel()}
          className="h-10 w-10 items-center justify-center rounded-md"
        >
          <Icon
            name="circle-x"
            size={28}
            hslColor={hsl("foreground-errors", colorScheme)}
          />
        </Pressable>
      </View>
      <SplitDirectionTool
        side={splitSide}
        onSplitSide={onSplitSide}
        currentColor={splitCurrentColor}
        newColor={splitNewColor}
      />
      <Pressable
        onPress={onOpenCategory}
        accessibilityRole="button"
        accessibilityLabel={thoughtsEditorCategoryAccessibilityLabel()}
        style={[styles.splitCategoryChip, { backgroundColor: chipBackground }]}
      >
        <View
          className="h-3 w-3 rounded-full"
          style={{
            backgroundColor: selectedCategoryColor ?? hsl("muted", colorScheme),
          }}
        />
        <Typography className="min-w-0 flex-1 text-base" numberOfLines={1}>
          {selectedCategoryLabel}
        </Typography>
        <Icon name="chevron-down" size={16} color="muted-foreground" />
      </Pressable>
    </View>
  );
}

function MergeSessionToolbar({
  mergeCanConfirm,
  selectedCategoryLabel,
  selectedCategoryColor,
  onConfirmMerge,
  onCancelMerge,
  onOpenCategory,
}: {
  mergeCanConfirm: boolean;
  selectedCategoryLabel: string;
  selectedCategoryColor: string | null;
  onConfirmMerge: () => void;
  onCancelMerge: () => void;
  onOpenCategory: () => void;
}) {
  const { colorScheme } = useColorScheme();
  const chipBackground = hsl("muted", colorScheme).replace(
    /^hsl\((.+)\)$/,
    "hsla($1, 0.35)"
  );

  return (
    <View className="flex-row items-center" style={styles.splitSession}>
      <View style={styles.splitConfirmCluster}>
        <Pressable
          onPress={onConfirmMerge}
          disabled={!mergeCanConfirm}
          accessibilityRole="button"
          accessibilityLabel={thoughtsEditorMergeConfirmAccessibilityLabel()}
          className="h-10 w-10 items-center justify-center rounded-md"
          style={!mergeCanConfirm ? { opacity: 0.4 } : undefined}
        >
          <Icon name="circle-check" size={28} color="primary" />
        </Pressable>
        <Pressable
          onPress={onCancelMerge}
          accessibilityRole="button"
          accessibilityLabel={thoughtsEditorMergeCancelAccessibilityLabel()}
          className="h-10 w-10 items-center justify-center rounded-md"
        >
          <Icon
            name="circle-x"
            size={28}
            hslColor={hsl("foreground-errors", colorScheme)}
          />
        </Pressable>
      </View>
      <Pressable
        onPress={onOpenCategory}
        accessibilityRole="button"
        accessibilityLabel={thoughtsEditorCategoryAccessibilityLabel()}
        style={[styles.splitCategoryChip, { backgroundColor: chipBackground }]}
      >
        <View
          className="h-3 w-3 rounded-full"
          style={{
            backgroundColor: selectedCategoryColor ?? hsl("muted", colorScheme),
          }}
        />
        <Typography className="min-w-0 flex-1 text-base" numberOfLines={1}>
          {selectedCategoryLabel}
        </Typography>
        <Icon name="chevron-down" size={16} color="muted-foreground" />
      </Pressable>
    </View>
  );
}

function SplitDirectionTool({
  side,
  onSplitSide,
  currentColor,
  newColor,
}: {
  side: "left" | "right";
  onSplitSide: (side: "left" | "right") => void;
  currentColor?: string | null;
  newColor?: string | null;
}) {
  const { colorScheme } = useColorScheme();
  const leftColor = side === "left" ? newColor : currentColor;
  const rightColor = side === "right" ? newColor : currentColor;
  return (
    <View
      className="h-10 flex-row items-center rounded-md px-1"
      style={{ backgroundColor: hsl("border", colorScheme) }}
    >
      <SplitColorSwatch color={leftColor} />
      <Pressable
        onPress={() => onSplitSide("left")}
        accessibilityRole="button"
        accessibilityLabel={thoughtsEditorSplitLeftAccessibilityLabel()}
        accessibilityState={{ selected: side === "left" }}
        className="h-10 w-7 items-center justify-center"
      >
        <Icon
          name="arrow-left"
          size={16}
          color={side === "left" ? "primary" : "muted-foreground"}
        />
      </Pressable>
      <Icon name="square-split-horizontal" size={18} color="primary" />
      <Pressable
        onPress={() => onSplitSide("right")}
        accessibilityRole="button"
        accessibilityLabel={thoughtsEditorSplitRightAccessibilityLabel()}
        accessibilityState={{ selected: side === "right" }}
        className="h-10 w-7 items-center justify-center"
      >
        <Icon
          name="arrow-right"
          size={16}
          color={side === "right" ? "primary" : "muted-foreground"}
        />
      </Pressable>
      <SplitColorSwatch color={rightColor} />
    </View>
  );
}

function SplitToolButton({
  disabled,
  onPress,
}: {
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={thoughtsEditorSplitAccessibilityLabel()}
      accessibilityHint={thoughtsEditorSplitCursorAccessibilityHint()}
      className="h-10 w-10 items-center justify-center rounded-md"
      style={disabled ? { opacity: 0.5 } : undefined}
    >
      <Icon name="square-split-horizontal" size={18} color="foreground" />
    </Pressable>
  );
}

function MergeToolButton({
  disabled,
  onPress,
}: {
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={thoughtsEditorMergeAccessibilityLabel()}
      accessibilityHint={thoughtsEditorMergeAccessibilityHint()}
      className="h-10 w-10 items-center justify-center rounded-md"
      style={disabled ? { opacity: 0.5 } : undefined}
    >
      <Icon name="squares-unite" size={18} color="foreground" />
    </Pressable>
  );
}

function DetailsToolbar({
  thoughtType,
  selectedTitle,
  selectedCategoryLabel,
  selectedCategoryColor,
  hasSelectedThought,
  onEditTitle,
  onOpenCategory,
  onOpenGraph,
  categoriesHidden,
  categoryOpacity,
  onToggleCategories,
  onCategoryOpacityChange,
  splitSide,
  splitCurrentColor,
  splitNewColor,
  onSplit,
  onSplitSide,
  onConfirmSplit,
  onCancelSplit,
  merging,
  mergeCanConfirm,
  onMerge,
  onConfirmMerge,
  onCancelMerge,
}: Pick<
  ThoughtsEditorToolbarProps,
  | "thoughtType"
  | "selectedTitle"
  | "selectedCategoryLabel"
  | "selectedCategoryColor"
  | "hasSelectedThought"
  | "onEditTitle"
  | "onOpenCategory"
  | "onOpenGraph"
  | "categoriesHidden"
  | "categoryOpacity"
  | "onToggleCategories"
  | "onCategoryOpacityChange"
  | "splitSide"
  | "splitCurrentColor"
  | "splitNewColor"
  | "onSplit"
  | "onSplitSide"
  | "onConfirmSplit"
  | "onCancelSplit"
  | "merging"
  | "mergeCanConfirm"
  | "onMerge"
  | "onConfirmMerge"
  | "onCancelMerge"
>) {
  const { colorScheme } = useColorScheme();
  const placeholder = thoughtsEditorNoTitleYet();
  const scrollRef = React.useRef<ScrollView>(null);
  const blendRef = React.useRef<View>(null);
  const [pageWidth, setPageWidth] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [opacityPopupAnchor, setOpacityPopupAnchor] = React.useState<{
    x: number;
    y: number;
    width: number;
  } | null>(null);
  const [opacityPopupVisible, setOpacityPopupVisible] = React.useState(false);
  const categoriesShowing = !categoriesHidden;
  const chipBackground = hsl("muted", colorScheme).replace(
    /^hsl\((.+)\)$/,
    "hsla($1, 0.35)"
  );

  const openOpacityPopup = () => {
    if (!categoriesShowing) onToggleCategories();
    blendRef.current?.measureInWindow((x, y, width) => {
      setOpacityPopupAnchor({ x, y, width });
      setOpacityPopupVisible(true);
    });
  };

  const goToPage = (next: number) => {
    setPage(next);
    scrollRef.current?.scrollTo({ x: next * pageWidth, animated: true });
  };

  const inToolSession = Boolean(splitSide) || merging;
  const capabilities = thoughtCapabilities(thoughtType);
  const headingSelected = isHeadingType(thoughtType);
  const mutedChipColor = hsl("muted-foreground", colorScheme);

  React.useEffect(() => {
    if (inToolSession) return;
    setPage(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [inToolSession]);

  return (
    <View
      className="flex-row items-center"
      style={inToolSession ? styles.splitContent : styles.detailsContent}
    >
      {splitSide ? (
        <SplitSessionToolbar
          splitSide={splitSide}
          selectedCategoryLabel={selectedCategoryLabel}
          selectedCategoryColor={selectedCategoryColor}
          splitCurrentColor={splitCurrentColor}
          splitNewColor={splitNewColor}
          onConfirmSplit={onConfirmSplit}
          onCancelSplit={onCancelSplit}
          onSplitSide={onSplitSide}
          onOpenCategory={onOpenCategory}
        />
      ) : merging ? (
        <MergeSessionToolbar
          mergeCanConfirm={mergeCanConfirm}
          selectedCategoryLabel={selectedCategoryLabel}
          selectedCategoryColor={selectedCategoryColor}
          onConfirmMerge={onConfirmMerge}
          onCancelMerge={onCancelMerge}
          onOpenCategory={onOpenCategory}
        />
      ) : (
        <>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
            style={styles.detailsScroll}
            onLayout={(event) => {
              setPageWidth(event.nativeEvent.layout.width);
            }}
            onMomentumScrollEnd={(event) => {
              if (pageWidth <= 0) return;
              setPage(
                Math.round(event.nativeEvent.contentOffset.x / pageWidth)
              );
            }}
          >
            <View
              style={[
                styles.detailsPage,
                pageWidth ? { width: pageWidth } : null,
              ]}
            >
              {headingSelected ? (
                <View
                  accessibilityRole="text"
                  accessibilityLabel={thoughtsEditorNoThoughtSelected()}
                  style={[styles.chip, { backgroundColor: chipBackground }]}
                >
                  <Typography
                    className="min-w-0 flex-1 text-base"
                    numberOfLines={1}
                    style={{ color: mutedChipColor }}
                  >
                    {thoughtsEditorNoThoughtSelected()}
                  </Typography>
                </View>
              ) : capabilities.title ? (
                <Pressable
                  onPress={onEditTitle}
                  disabled={!hasSelectedThought}
                  accessibilityRole="button"
                  accessibilityLabel={thoughtsEditorEditTitleAccessibilityLabel()}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: chipBackground,
                      opacity: hasSelectedThought ? 1 : 0.5,
                    },
                  ]}
                >
                  <Typography
                    className="min-w-0 flex-1 text-base"
                    numberOfLines={1}
                    style={
                      selectedTitle ? undefined : { color: mutedChipColor }
                    }
                  >
                    {selectedTitle || placeholder}
                  </Typography>
                  <Icon name="pencil" size={16} color="foreground" />
                </Pressable>
              ) : null}
              {headingSelected ? (
                <View
                  accessibilityRole="text"
                  accessibilityLabel={thoughtsEditorCategoryUnavailable()}
                  style={[styles.chip, { backgroundColor: chipBackground }]}
                >
                  <View
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: hsl("muted", colorScheme) }}
                  />
                  <Typography
                    className="min-w-0 flex-1 text-base"
                    numberOfLines={1}
                    style={{ color: mutedChipColor }}
                  >
                    {thoughtsEditorCategoryUnavailable()}
                  </Typography>
                </View>
              ) : capabilities.categoryHighlight ? (
                <Pressable
                  onPress={onOpenCategory}
                  disabled={!hasSelectedThought}
                  accessibilityRole="button"
                  accessibilityLabel={thoughtsEditorCategoryAccessibilityLabel()}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: chipBackground,
                      opacity: hasSelectedThought ? 1 : 0.5,
                    },
                  ]}
                >
                  <View
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        selectedCategoryColor ?? hsl("muted", colorScheme),
                    }}
                  />
                  <Typography
                    className="min-w-0 flex-1 text-base"
                    numberOfLines={1}
                  >
                    {selectedCategoryLabel}
                  </Typography>
                  <Icon
                    name="chevron-down"
                    size={16}
                    color="muted-foreground"
                  />
                </Pressable>
              ) : null}
              {capabilities.graph ? (
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
              ) : null}
            </View>
            <View
              style={[
                styles.detailsPage,
                pageWidth ? { width: pageWidth } : null,
              ]}
            >
              <Pressable
                onPress={onToggleCategories}
                accessibilityRole="button"
                accessibilityLabel={
                  categoriesShowing
                    ? thoughtsEditorHideCategoriesAccessibilityLabel()
                    : thoughtsEditorShowCategoriesAccessibilityLabel()
                }
                accessibilityState={{ selected: categoriesShowing }}
                className="h-10 w-10 items-center justify-center rounded-md"
                style={
                  categoriesShowing
                    ? { backgroundColor: hsl("border", colorScheme) }
                    : { opacity: 0.45 }
                }
              >
                <Icon
                  name={categoriesShowing ? "eye" : "eye-off"}
                  size={20}
                  color={categoriesShowing ? "primary" : "muted-foreground"}
                />
              </Pressable>
              <Pressable
                ref={blendRef}
                onPress={openOpacityPopup}
                accessibilityRole="button"
                accessibilityLabel={thoughtsEditorCategoryOpacityAccessibilityLabel()}
                accessibilityState={{ selected: categoriesShowing }}
                className="h-10 w-10 items-center justify-center rounded-md"
                style={
                  categoriesShowing
                    ? { backgroundColor: hsl("border", colorScheme) }
                    : { opacity: 0.45 }
                }
              >
                <Icon
                  name={categoriesShowing ? "droplet" : "droplet-off"}
                  size={20}
                  color={categoriesShowing ? "primary" : "muted-foreground"}
                />
              </Pressable>
              {headingSelected ? null : (
                <>
                  <SplitToolButton
                    disabled={!hasSelectedThought}
                    onPress={onSplit}
                  />
                  <MergeToolButton
                    disabled={!hasSelectedThought}
                    onPress={onMerge}
                  />
                </>
              )}
            </View>
          </ScrollView>
          <Pressable
            onPress={() => goToPage(page === 0 ? 1 : 0)}
            accessibilityRole="button"
            accessibilityLabel={
              page === 0
                ? thoughtsEditorDetailsMoreOptionsAccessibilityLabel()
                : thoughtsEditorDetailsTitleCategoryAccessibilityLabel()
            }
            className="h-10 w-8 items-center justify-center"
          >
            <Icon
              name={page === 0 ? "chevron-right" : "chevron-left"}
              size={18}
              color="foreground"
            />
          </Pressable>
        </>
      )}
      {opacityPopupAnchor ? (
        <CategoryOpacityPopup
          visible={opacityPopupVisible}
          anchor={opacityPopupAnchor}
          opacity={categoryOpacity}
          onOpacityChange={onCategoryOpacityChange}
          onClose={() => setOpacityPopupVisible(false)}
          onExited={() => setOpacityPopupAnchor(null)}
        />
      ) : null}
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
        name={nextMode === "details" ? "shapes" : "type-outline"}
        size={18}
        color="foreground"
      />
    </Pressable>
  );
}

function ToolbarContent({
  mode,
  detailsProgress,
  ...props
}: Omit<ThoughtsEditorToolbarProps, "dockToKeyboard"> & {
  detailsProgress: SharedValue<number>;
}) {
  const formatStyle = useAnimatedStyle(() => ({
    opacity: 1 - detailsProgress.value,
  }));
  const detailsStyle = useAnimatedStyle(() => ({
    opacity: detailsProgress.value,
  }));

  return (
    <View style={styles.contentStack}>
      <Animated.View
        pointerEvents={mode === "format" ? "auto" : "none"}
        style={[styles.contentLayer, formatStyle]}
      >
        <FormatToolbar {...props} enabled={mode === "format"} />
      </Animated.View>
      <Animated.View
        pointerEvents={mode === "details" ? "auto" : "none"}
        style={[styles.contentLayer, detailsStyle]}
      >
        <DetailsToolbar {...props} />
      </Animated.View>
    </View>
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

  const contentHeight = useSharedValue(
    getThoughtsEditorToolbarHeight(contentProps.mode)
  );
  const detailsProgress = useSharedValue(
    contentProps.mode === "details" ? 1 : 0
  );

  React.useEffect(() => {
    contentHeight.value = withTiming(
      getThoughtsEditorToolbarHeight(contentProps.mode),
      { duration: TOOLBAR_HEIGHT_ANIMATION_MS, easing: HEIGHT_EASING }
    );
    detailsProgress.value = withTiming(
      contentProps.mode === "details" ? 1 : 0,
      {
        duration: TOOLBAR_HEIGHT_ANIMATION_MS,
        easing: Easing.out(Easing.quad),
      }
    );
  }, [contentHeight, contentProps.mode, detailsProgress]);

  const dockedStyle = useAnimatedStyle(() => {
    const keyboard = Math.max(0, keyboardHeight.value);
    const fill = Math.max(bottomInset, keyboard);
    const hidden = isOpening.value || opacity.value <= 0;
    return {
      height: contentHeight.value + fill,
      opacity: opacity.value,
      pointerEvents: hidden ? "none" : "box-none",
    };
  }, [bottomInset]);

  const contentRowStyle = useAnimatedStyle(() => ({
    height: contentHeight.value,
  }));

  const portalName = React.useId();
  const content = (
    <ToolbarContent {...contentProps} detailsProgress={detailsProgress} />
  );
  const toggle =
    contentProps.splitSide || contentProps.merging ? null : (
      <ToolbarToggle
        mode={contentProps.mode}
        onModeChange={contentProps.onModeChange}
      />
    );

  if (!dockToKeyboard) {
    return (
      <View style={{ overflow: "visible", zIndex: 20, elevation: 20 }}>
        <Animated.View
          style={[
            styles.inFlow,
            contentRowStyle,
            {
              backgroundColor,
              borderTopColor: borderColor,
            },
          ]}
        >
          {content}
        </Animated.View>
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
          <Animated.View style={[styles.dockedRow, contentRowStyle]}>
            {content}
          </Animated.View>
        </Animated.View>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  inFlow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    overflow: "hidden",
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
    overflow: "hidden",
    justifyContent: "center",
  },
  contentStack: {
    flex: 1,
    overflow: "hidden",
  },
  contentLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 5,
    paddingRight: 56,
  },
  detailsContent: {
    paddingLeft: 10,
    paddingRight: 56,
    flex: 1,
  },
  splitContent: {
    paddingLeft: 6,
    paddingRight: 12,
    flex: 1,
  },
  splitSession: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  splitConfirmCluster: {
    flexDirection: "row",
    alignItems: "center",
  },
  splitCategoryChip: {
    height: 36,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 72,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingLeft: 10,
    paddingRight: 8,
    gap: 6,
    marginLeft: 4,
  },
  detailsScroll: {
    flex: 1,
  },
  detailsPage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    height: 36,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 96,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingLeft: 10,
    paddingRight: 8,
    gap: 6,
  },
  typeTrigger: {
    height: 40,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    gap: 6,
  },
  typePopup: {
    position: "absolute",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    padding: 6,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    gap: 2,
  },
  typeOption: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    gap: 10,
  },
  opacityPopup: {
    position: "absolute",
    width: OPACITY_POPUP_WIDTH,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  opacitySliderSlot: {
    width: OPACITY_SLIDER_WIDTH,
    height: 36,
    justifyContent: "center",
  },
  opacityTrack: {
    height: 4,
    width: "100%",
    borderRadius: 2,
    overflow: "hidden",
  },
  opacityFill: {
    height: 4,
    borderRadius: 2,
  },
  opacityThumb: {
    position: "absolute",
    top: 10,
    width: 16,
    height: 16,
    borderRadius: 8,
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
