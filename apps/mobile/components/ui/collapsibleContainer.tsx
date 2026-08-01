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
   * When provided, animate to this height instead of measuring children.
   * Prefer this for large trees so expand/collapse doesn’t wait on layout.
   */
  contentHeight: contentHeightProp,
}: {
  children: React.ReactNode;
  expanded: boolean;
  className?: string;
  contentHeight?: number;
}) => {
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const contentHeight = contentHeightProp ?? measuredHeight;
  const height = useSharedValue(expanded ? contentHeight : 0);
  const hasInitialized = useRef(false);
  const measureLayout = contentHeightProp == null;

  useEffect(() => {
    const target = expanded ? contentHeight : 0;
    if (!hasInitialized.current) {
      height.value = target;
      hasInitialized.current = true;
      return;
    }
    height.value = withTiming(target, { duration: COLLAPSE_DURATION_MS });
  }, [contentHeight, expanded, height]);

  const animatedHeight = useAnimatedStyle(() => ({
    height: height.value,
  }));

  const onLayout = (event: LayoutChangeEvent) => {
    if (!measureLayout) return;
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
      <View
        style={{ position: "absolute", width: "100%" }}
        onLayout={measureLayout ? onLayout : undefined}
      >
        {children}
      </View>
    </Animated.View>
  );
};
