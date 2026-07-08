import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { Icon } from "@/components/ui/icons/icon";
import { Button } from "@/components/ui/button";
import { X } from "@/lib/icons/Times";
import { LAYOUT_SIZES } from "@/components/layout/constants";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { FloatingModalTabs } from "@/features/notes/floatingModal/tabs";
import type { FloatingModalTab } from "@/features/notes/floatingModal/tabs/types";

const BUTTON_SIZE = 56;
const BORDER_RADIUS = BUTTON_SIZE / 2;
const EXPANDED_TOP_BORDER_RADIUS = 16;
const EXPANDED_TOP_PADDING = 4;
const DEFAULT_VERTICAL_GAP = 16;
const PANEL_BORDER_WIDTH = 2;

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

  const bottomOffset = bottomOffsetProp ?? tabBarTop + DEFAULT_VERTICAL_GAP;

  const verticalGap = bottomOffset - tabBarTop;
  const topOffset = (topOffsetProp ?? verticalGap) + EXPANDED_TOP_PADDING;

  const expandedHeight = Math.max(
    BUTTON_SIZE,
    screenHeight - bottomOffset - topOffset
  );
  const tabBarGutter = 8;
  const expandedWidth = screenWidth - tabBarGutter * 2;

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
    borderBottomLeftRadius: BORDER_RADIUS,
    borderBottomRightRadius: BORDER_RADIUS,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
  }));

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <View
        pointerEvents="box-none"
        style={[styles.anchor, { right: tabBarGutter, bottom: bottomOffset }]}
      >
        {!isOpen && (
          <Pressable
            onPress={expand}
            style={[
              styles.fab,
              {
                backgroundColor: popoverColor,
                borderColor,
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
                    <View className="flex-1 min-h-0 pb-4">{children}</View>
                  )}
                </View>
              ) : (
                <View
                  className="flex-1 min-h-0 pb-4"
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
      </View>
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
    borderWidth: PANEL_BORDER_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  shell: {
    overflow: "hidden",
    borderWidth: PANEL_BORDER_WIDTH,
  },
  expandedContent: {
    ...StyleSheet.absoluteFillObject,
  },
});
