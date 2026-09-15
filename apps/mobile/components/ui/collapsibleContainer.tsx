import React, { useEffect, useRef, useState } from "react";
import { View, LayoutChangeEvent } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const COLLAPSE_DURATION_MS = 200;

export const CollapsibleContainer = ({
  children,
  expanded,
  className,
  /**
   * Optional estimated height for the first animated paint.
   * Layout is still measured and follows the real content as it changes.
   */
  contentHeight: contentHeightProp,
  duration = COLLAPSE_DURATION_MS,
}: {
  children: React.ReactNode;
  expanded: boolean;
  className?: string;
  contentHeight?: number;
  duration?: number;
}) => {
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const contentHeight =
    measuredHeight > 0 ? measuredHeight : (contentHeightProp ?? 0);
  const height = useSharedValue(expanded ? contentHeight : 0);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (duration <= 0) return;
    const target = expanded ? contentHeight : 0;
    if (!hasInitialized.current) {
      height.value = target;
      hasInitialized.current = true;
      return;
    }
    height.value = withTiming(target, { duration });
  }, [contentHeight, duration, expanded, height]);

  const animatedHeight = useAnimatedStyle(() => ({
    height: height.value,
  }));

  const onLayout = (event: LayoutChangeEvent) => {
    const layoutHeight = event.nativeEvent.layout.height;
    if (layoutHeight > 0) {
      setMeasuredHeight((prev) =>
        prev === layoutHeight ? prev : layoutHeight
      );
    }
  };

  // Instant expand/collapse must not lock a measured height — nested rows and
  // wrapping text keep growing after the first layout.
  if (duration <= 0) {
    return (
      <View
        className={className}
        style={expanded ? undefined : { height: 0, overflow: "hidden" }}
        pointerEvents={expanded ? "auto" : "none"}
      >
        {children}
      </View>
    );
  }

  return (
    <Animated.View
      style={[animatedHeight, { overflow: "hidden" }]}
      className={className}
    >
      <View
        collapsable={false}
        style={{ position: "absolute", left: 0, width: "100%" }}
        onLayout={onLayout}
      >
        {children}
      </View>
    </Animated.View>
  );
};
