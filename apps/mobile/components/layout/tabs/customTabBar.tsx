import { View, LayoutChangeEvent } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const { TAB_BAR_HEIGHT } = LAYOUT_SIZES;

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const buttonWidth =
    dimensions.width > 0 ? dimensions.width / state.routes.length : 0;

  const onTabBarLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  };

  const tabPositionX = useSharedValue(0);

  useEffect(() => {
    if (dimensions.width > 0 && state.routes.length > 0) {
      tabPositionX.value = withSpring(state.index * buttonWidth, {
        duration: 350,
      });
    }
  }, [state.index, buttonWidth, dimensions.width, state.routes.length]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabPositionX.value }],
  }));

  return (
    <View
      style={{
        bottom: 0,
        paddingBottom: insets.bottom,
      }}
      className="right-0 left-0 bg-popover z-30 absolute overflow-hidden rounded-t-xl"
    >
      <View
        onLayout={onTabBarLayout}
        className="flex-row items-center"
        style={{ height: TAB_BAR_HEIGHT }}
      >
        {dimensions.width > 0 && (
          <Animated.View
            className="absolute h-full"
            style={[animatedStyle, { width: buttonWidth }]}
          >
            <View className="h-full w-full bg-background rounded-md" />
          </Animated.View>
        )}

        {state.routes.map((route) => {
          const { options } = descriptors[route.key];
          const isFocused = state.routes[state.index].key === route.key;
          const label = options.tabBarLabel ?? options.title ?? route.name;

          const onPress = () => {
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
    </View>
  );
}
