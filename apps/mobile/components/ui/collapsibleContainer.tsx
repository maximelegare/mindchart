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
   * Optional estimated height for the first paint.
   * Layout is still measured; if the real content is taller, the container grows
   * so long titles/summaries are not clipped.
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
  // Prefer the laid-out height so overestimated tree metrics don't leave a
  // gap under the last row. Fall back to the estimate until layout runs.
  const contentHeight =
    measuredHeight > 0 ? measuredHeight : (contentHeightProp ?? 0);
  const height = useSharedValue(expanded ? contentHeight : 0);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const target = expanded ? contentHeight : 0;
    if (!hasInitialized.current || duration <= 0) {
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

  return (
    <Animated.View
      style={[animatedHeight, { overflow: "hidden" }]}
      className={className}
    >
      <View style={{ position: "absolute", width: "100%" }} onLayout={onLayout}>
        {children}
      </View>
    </Animated.View>
  );
};
