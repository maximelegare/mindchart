import React, { useEffect, useState } from "react";
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
}: {
  children: React.ReactNode;
  expanded: boolean;
  className?: string;
}) => {
  const [contentHeight, setContentHeight] = useState(0);
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = withTiming(expanded ? contentHeight : 0, {
      duration: COLLAPSE_DURATION_MS,
    });
  }, [contentHeight, expanded, height]);

  const animatedHeight = useAnimatedStyle(() => ({
    height: height.value,
  }));

  const onLayout = (event: LayoutChangeEvent) => {
    const layoutHeight = event.nativeEvent.layout.height;
    if (layoutHeight > 0) {
      setContentHeight((prev) => (prev === layoutHeight ? prev : layoutHeight));
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
