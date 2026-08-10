import { useEffect, useState } from "react";
import { View } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { TabBarButton } from "./tabBarButton";
import { useTabChromeStore } from "./tabChromeStore";

const FADE_MS = 220;

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const hidden = useTabChromeStore((s) => s.hidden);
  const [mounted, setMounted] = useState(!hidden);
  const opacity = useSharedValue(hidden ? 0 : 1);
  const translateY = useSharedValue(hidden ? 12 : 0);

  useEffect(() => {
    if (hidden) {
      opacity.value = withTiming(0, { duration: FADE_MS }, (finished) => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      });
      translateY.value = withTiming(12, { duration: FADE_MS });
      return;
    }

    setMounted(true);
    opacity.value = 0;
    translateY.value = 12;
    opacity.value = withTiming(1, { duration: FADE_MS });
    translateY.value = withTiming(0, { duration: FADE_MS });
  }, [hidden, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!mounted) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents={hidden ? "none" : "auto"}
      style={animatedStyle}
      className="bg-footer z-30 rounded-t-3xl overflow-hidden"
    >
      <View className="flex-row items-start">
        {state.routes.map((route) => {
          // Home (`index`) is a redirect-only route — never show it in the tab bar.
          if (route.name === "index") return null;

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
              bottomInset={insets.bottom}
            />
          );
        })}
      </View>
    </Animated.View>
  );
}
