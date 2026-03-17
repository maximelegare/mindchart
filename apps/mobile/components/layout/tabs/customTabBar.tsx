// components/navigation/TabBar.tsx
import { View, LayoutChangeEvent } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "@/lib/cn";

import { Gutter } from "@/components/ui/gutter";
import { LAYOUT_SIZES } from "../constants";
import { TabBarButton } from "./tabBarButton";
import { useState, useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const { TAB_BAR_HEIGHT, TAB_BAR_PADDING_COMPENSATION } = LAYOUT_SIZES;

  const [dimensions, setDimensions] = useState({ width: 20, height: 100 });

  const buttonWidth = dimensions.width / state.routes.length;

  const onTabBarLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  };

  const tabPositionX = useSharedValue(0);

  // Update indicator position when route changes (including programmatic navigation)
  useEffect(() => {
    if (dimensions.width > 0 && state.routes.length > 0) {
      const targetPosition = state.index * buttonWidth;
      tabPositionX.value = withSpring(targetPosition, { duration: 350 });
    }
  }, [state.index, buttonWidth, dimensions.width, state.routes.length]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabPositionX.value }],
  }));

  return (
    <Gutter size="md">
      <View
        onLayout={onTabBarLayout}
        style={{
          bottom: insets.bottom + TAB_BAR_PADDING_COMPENSATION,
          height: TAB_BAR_HEIGHT,
        }}
        className={cn(
          "right-0 left-0 flex-row items-center justify-between bg-popover px-1 z-30 absolute rounded-3xl"
        )}
      >
        <Animated.View
          className={cn("absolute h-full rounded-3xl")}
          style={[animatedStyle, { width: buttonWidth }]}
        >
          <View
            className="h-full w-full bg-background rounded-3xl border-4 border-popover"
            style={{ opacity: 1 }}
          ></View>
        </Animated.View>

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const label = options.tabBarLabel ?? options.title ?? route.name;

          const onPress = () => {
            tabPositionX.value = withSpring(index * buttonWidth, {
              duration: 350,
            });
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          return (
            <TabBarButton
              key={route.name}
              routeName={route.name}
              onPress={onPress}
              isFocused={isFocused}
              label={label as string}
            />
          );
        })}
      </View>
    </Gutter>
  );
}
