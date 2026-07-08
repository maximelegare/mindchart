import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icons/icon";
import { Button } from "@/components/ui/button";
import { X } from "@/lib/icons/Times";
import { LAYOUT_SIZES } from "@/components/layout/constants";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";

const BUTTON_SIZE = 56;
const BORDER_RADIUS = BUTTON_SIZE / 2;
const EXPANDED_TOP_BORDER_RADIUS = 16;
const EXPANDED_TOP_PADDING = 4;
const DEFAULT_VERTICAL_GAP = 16;
const PANEL_BORDER_WIDTH = 2;

const springConfig = {
  damping: 16,
  stiffness: 200,
  mass: 0.65,
};

type FloatingModalProps = {
  children?: React.ReactNode;
  bottomOffset?: number;
  topOffset?: number;
};

export const FloatingModal = ({
  children,
  bottomOffset: bottomOffsetProp,
  topOffset: topOffsetProp,
}: FloatingModalProps) => {
  const [expanded, setExpanded] = useState(false);
  const progress = useSharedValue(0);
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
  // Matches Gutter size="md" used by CustomTabBar
  const tabBarGutter = 8;
  const expandedWidth = screenWidth - tabBarGutter * 2;
  const collapsedLeft = screenWidth - tabBarGutter - BUTTON_SIZE;

  const expand = useCallback(() => {
    setExpanded(true);
    progress.value = withSpring(1, springConfig);
  }, [progress]);

  const collapse = useCallback(() => {
    progress.value = withSpring(0, springConfig, (finished) => {
      if (finished) {
        runOnJS(setExpanded)(false);
      }
    });
  }, [progress]);

  const containerStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [BUTTON_SIZE, expandedWidth]),
    height: interpolate(progress.value, [0, 1], [BUTTON_SIZE, expandedHeight]),
    bottom: bottomOffset,
    left: interpolate(progress.value, [0, 1], [collapsedLeft, tabBarGutter]),
    borderTopLeftRadius: interpolate(
      progress.value,
      [0, 1],
      [BORDER_RADIUS, EXPANDED_TOP_BORDER_RADIUS]
    ),
    borderTopRightRadius: interpolate(
      progress.value,
      [0, 1],
      [BORDER_RADIUS, EXPANDED_TOP_BORDER_RADIUS]
    ),
    borderBottomLeftRadius: BORDER_RADIUS,
    borderBottomRightRadius: BORDER_RADIUS,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.35, 1], [0, 1]),
  }));

  const collapsedIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.25], [1, 0]),
  }));

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <Animated.View
        style={[
          containerStyle,
          styles.container,
          {
            backgroundColor: hsl("popover", colorScheme),
            borderColor: hsl("background", colorScheme),
          },
        ]}
      >
        {!expanded && (
          <Pressable
            onPress={expand}
            style={styles.pressable}
            accessibilityRole="button"
            accessibilityLabel="Open floating modal"
          >
            <Animated.View style={[collapsedIconStyle, styles.iconCenter]}>
              <Icon name="plus" size={24} color="text" />
            </Animated.View>
          </Pressable>
        )}

        {expanded && (
          <Animated.View
            style={[
              contentStyle,
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

            <View className="flex-1 px-4 pb-4">
              {children ?? (
                <Typography className="text-popover-foreground">
                  Floating Modal
                </Typography>
              )}
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 50,
    elevation: 50,
    overflow: "hidden",
    borderWidth: PANEL_BORDER_WIDTH,
  },
  pressable: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  expandedContent: {
    ...StyleSheet.absoluteFillObject,
  },
});
