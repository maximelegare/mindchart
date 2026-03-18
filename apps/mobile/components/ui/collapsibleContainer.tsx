import React from "react";
import { View, LayoutChangeEvent } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export const CollapsibleContainer = ({
  children,
  expanded,
}: {
  children: React.ReactNode;
  expanded: boolean;
}) => {
  const height = useSharedValue(0);
  const animatedHeight = useAnimatedStyle(() => ({
    height: expanded ? withTiming(height.value) : withTiming(0),
    opacity: expanded ? withTiming(1) : withTiming(0), // Smoother transition
  }));

  const onLayout = (event: LayoutChangeEvent) => {
    const layoutHeight = event.nativeEvent.layout.height;
    if (layoutHeight > 0 && height.value !== layoutHeight) {
      height.value = layoutHeight;
    }
  };

  return (
    <Animated.View style={[animatedHeight, { overflow: "hidden" }]}>
      <View style={{ position: "absolute", width: "100%" }} onLayout={onLayout}>
        {children}
      </View>
    </Animated.View>
  );
};
