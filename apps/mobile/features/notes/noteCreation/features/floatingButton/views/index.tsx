import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getCornerRadiusSync } from "expo-screen-corner-radius";
import { Icon } from "@/components/ui/icons/icon";
import { Button } from "@/components/ui/button";
import { X } from "@/lib/icons/Times";
import { LAYOUT_SIZES } from "@/components/layout/constants";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { FloatingModalTabs } from "@/features/notes/noteCreation/features/floatingButton/components/header";
import type { FloatingModalTab } from "@/features/notes/noteCreation/features/floatingButton/types/types";

const BUTTON_SIZE = 56;
const BORDER_RADIUS = BUTTON_SIZE / 2;
const EXPANDED_TOP_BORDER_RADIUS = 20;
const EXPANDED_TOP_PADDING = 0;
const FAB_BOTTOM_GAP = 16;
const EXPANDED_BOTTOM_GAP = 4;
const FAB_HORIZONTAL_GUTTER = 8;
const EXPANDED_HORIZONTAL_GUTTER = 4;
const FAB_BORDER_WIDTH = 2;
const EXPANDED_BORDER_WIDTH = 1;

function getExpandedBottomRadius() {
  try {
    const deviceRadius = getCornerRadiusSync();
    if (deviceRadius != null && deviceRadius > 0) {
      return deviceRadius;
    }
  } catch {
    return EXPANDED_TOP_BORDER_RADIUS;
  }

  return EXPANDED_TOP_BORDER_RADIUS;
}

const ANIMATION_MS = 380;

const timingConfig = {
  duration: ANIMATION_MS,
  easing: Easing.out(Easing.cubic),
};

const TAB_CONTENT_DELAY_MS = 150;
const ICON_FADE_MS = 220;

type FloatingModalProps = {
  children?: React.ReactNode;
  tabs?: FloatingModalTab[];
  bottomOffset?: number;
  topOffset?: number;
};

export const FloatingModal = ({
  children,
  tabs,
  bottomOffset: bottomOffsetProp,
  topOffset: topOffsetProp,
}: FloatingModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mountHeader, setMountHeader] = useState(false);
  const [mountTabContent, setMountTabContent] = useState(false);
  const tabContentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progress = useSharedValue(0);
  const iconOpacity = useSharedValue(1);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const { TAB_BAR_HEIGHT, TAB_BAR_PADDING_COMPENSATION } = LAYOUT_SIZES;

  const tabBarTop =
    insets.bottom + TAB_BAR_HEIGHT + TAB_BAR_PADDING_COMPENSATION;

  // FAB sits above the tab bar; expanded shell covers tab bar + bottom inset.
  const fabBottomOffset = bottomOffsetProp ?? tabBarTop + FAB_BOTTOM_GAP;
  const expandedBottomOffset = EXPANDED_BOTTOM_GAP;

  const topOffset =
    (topOffsetProp ?? fabBottomOffset - tabBarTop) + EXPANDED_TOP_PADDING;

  const expandedHeight = Math.max(
    BUTTON_SIZE,
    screenHeight - expandedBottomOffset - topOffset
  );
  const expandedWidth = screenWidth - EXPANDED_HORIZONTAL_GUTTER * 2;
  const expandedBottomRadius = useMemo(() => getExpandedBottomRadius(), []);

  const popoverColor = hsl("popover", colorScheme);
  const borderColor = hsl("background", colorScheme);

  const clearTabContentTimer = useCallback(() => {
    if (tabContentTimerRef.current) {
      clearTimeout(tabContentTimerRef.current);
      tabContentTimerRef.current = null;
    }
  }, []);

  const onExpandComplete = useCallback(() => {
    setMountHeader(true);
    clearTabContentTimer();
    tabContentTimerRef.current = setTimeout(() => {
      setMountTabContent(true);
      tabContentTimerRef.current = null;
    }, TAB_CONTENT_DELAY_MS);
  }, [clearTabContentTimer]);

  const animateIconIn = useCallback(() => {
    iconOpacity.value = 0;
    iconOpacity.value = withTiming(1, { duration: ICON_FADE_MS });
  }, [iconOpacity]);

  const onCollapseComplete = useCallback(() => {
    setIsOpen(false);
    animateIconIn();
  }, [animateIconIn]);

  const expand = useCallback(() => {
    clearTabContentTimer();
    iconOpacity.value = 0;
    setIsOpen(true);
    setMountHeader(false);
    setMountTabContent(false);
    progress.value = 0;
    progress.value = withTiming(1, timingConfig, (finished) => {
      if (finished) {
        runOnJS(onExpandComplete)();
      }
    });
  }, [clearTabContentTimer, iconOpacity, onExpandComplete, progress]);

  const collapse = useCallback(() => {
    clearTabContentTimer();
    setMountHeader(false);
    setMountTabContent(false);
    progress.value = withTiming(0, timingConfig, (finished) => {
      if (finished) {
        runOnJS(onCollapseComplete)();
      }
    });
  }, [clearTabContentTimer, onCollapseComplete, progress]);

  useEffect(() => () => clearTabContentTimer(), [clearTabContentTimer]);

  const anchorStyle = useAnimatedStyle(() => ({
    right: interpolate(
      progress.value,
      [0, 1],
      [FAB_HORIZONTAL_GUTTER, EXPANDED_HORIZONTAL_GUTTER],
      Extrapolation.CLAMP
    ),
    bottom: interpolate(
      progress.value,
      [0, 1],
      [fabBottomOffset, expandedBottomOffset],
      Extrapolation.CLAMP
    ),
  }));

  const shellStyle = useAnimatedStyle(() => ({
    width: interpolate(
      progress.value,
      [0, 1],
      [BUTTON_SIZE, expandedWidth],
      Extrapolation.CLAMP
    ),
    height: interpolate(
      progress.value,
      [0, 1],
      [BUTTON_SIZE, expandedHeight],
      Extrapolation.CLAMP
    ),
    borderWidth: interpolate(
      progress.value,
      [0, 1],
      [FAB_BORDER_WIDTH, EXPANDED_BORDER_WIDTH],
      Extrapolation.CLAMP
    ),
    borderTopLeftRadius: interpolate(
      progress.value,
      [0, 0.15, 1],
      [BORDER_RADIUS, BORDER_RADIUS, EXPANDED_TOP_BORDER_RADIUS],
      Extrapolation.CLAMP
    ),
    borderTopRightRadius: interpolate(
      progress.value,
      [0, 0.15, 1],
      [BORDER_RADIUS, BORDER_RADIUS, EXPANDED_TOP_BORDER_RADIUS],
      Extrapolation.CLAMP
    ),
    borderBottomLeftRadius: interpolate(
      progress.value,
      [0, 0.15, 1],
      [BORDER_RADIUS, BORDER_RADIUS, expandedBottomRadius],
      Extrapolation.CLAMP
    ),
    borderBottomRightRadius: interpolate(
      progress.value,
      [0, 0.15, 1],
      [BORDER_RADIUS, BORDER_RADIUS, expandedBottomRadius],
      Extrapolation.CLAMP
    ),
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
  }));

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.anchor,
          isOpen
            ? anchorStyle
            : { right: FAB_HORIZONTAL_GUTTER, bottom: fabBottomOffset },
        ]}
      >
        {!isOpen && (
          <Pressable
            onPress={expand}
            style={[
              styles.fab,
              {
                backgroundColor: popoverColor,
                borderColor,
                borderWidth: FAB_BORDER_WIDTH,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Open floating modal"
          >
            <Animated.View style={iconStyle}>
              <Icon name="pencil" size={24} color="popover-foreground" />
            </Animated.View>
          </Pressable>
        )}

        {isOpen && (
          <Animated.View
            style={[
              styles.shell,
              shellStyle,
              {
                backgroundColor: popoverColor,
                borderColor,
              },
            ]}
          >
            {mountHeader &&
              (children ? (
                <View
                  style={[
                    styles.expandedContent,
                    { paddingTop: EXPANDED_TOP_PADDING },
                  ]}
                >
                  <View className="flex-row justify-end p-2">
                    <Button
                      onPress={collapse}
                      variant="ghost"
                      size="icon"
                      accessibilityLabel="Close floating modal"
                    >
                      <X className="text-popover-foreground" size={24} />
                    </Button>
                  </View>
                  {mountTabContent && (
                    <View className="flex-1 min-h-0">{children}</View>
                  )}
                </View>
              ) : (
                <View
                  className="flex-1 min-h-0"
                  style={[
                    styles.expandedContent,
                    { paddingTop: EXPANDED_TOP_PADDING },
                  ]}
                >
                  <FloatingModalTabs
                    tabs={tabs}
                    onClose={collapse}
                    mountTabContent={mountTabContent}
                  />
                </View>
              ))}
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  anchor: {
    position: "absolute",
    zIndex: 50,
    elevation: 50,
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  fab: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BORDER_RADIUS,
    alignItems: "center",
    justifyContent: "center",
  },
  shell: {
    overflow: "hidden",
  },
  expandedContent: {
    ...StyleSheet.absoluteFillObject,
  },
});
