import { useEffect, useMemo, useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { TabBarButton } from "./tabBarButton";
import { getTabAccessibilityLabel, getTabLabel } from "./tabLabels";
import { useTabChromeStore } from "./tabChromeStore";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { LOGO_CHART_COLOR } from "@/components/ui/logo";

/** Match `PageContainer` SIDE_GUTTER / `gutter("sm")` so the pill aligns with the page sheet. */
const SIDE_GUTTER = 4;
const TAB_TOP_RADIUS = 24;
const FADE_MS = 220;
const INDICATOR_WIDTH = 36;
const INDICATOR_HEIGHT = 2.5;
const INDICATOR_SPRING = {
  damping: 16,
  stiffness: 220,
  mass: 0.6,
} as const;

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const hidden = useTabChromeStore((s) => s.hidden);
  const [mounted, setMounted] = useState(!hidden);
  const opacity = useSharedValue(hidden ? 0 : 1);
  const translateY = useSharedValue(hidden ? 12 : 0);

  // Same chrome as PageContainer side gutters.
  const sideChrome = hsl(
    colorScheme === "dark" ? "footer" : "foreground",
    colorScheme
  );
  const pageBackground = hsl("background", colorScheme);
  const footerColor = hsl("footer", colorScheme);
  const indicatorColor = LOGO_CHART_COLOR;

  const visibleRoutes = useMemo(
    () => state.routes.filter((route) => route.name !== "index"),
    [state.routes]
  );
  const focusedName =
    state.routes[state.index]?.name === "index"
      ? "notes"
      : state.routes[state.index]?.name;
  const focusedIndex = Math.max(
    0,
    visibleRoutes.findIndex((route) => route.name === focusedName)
  );

  const rowWidth = useSharedValue(0);
  const indicatorX = useSharedValue(0);

  const placeIndicator = (width: number, index: number, animated: boolean) => {
    if (width <= 0 || visibleRoutes.length === 0) return;
    const tabWidth = width / visibleRoutes.length;
    const nextX = tabWidth * index + (tabWidth - INDICATOR_WIDTH) / 2;
    indicatorX.value = animated ? withSpring(nextX, INDICATOR_SPRING) : nextX;
  };

  const onRowLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    const isFirstMeasure = rowWidth.value === 0;
    rowWidth.value = width;
    placeIndicator(width, focusedIndex, !isFirstMeasure);
  };

  useEffect(() => {
    placeIndicator(rowWidth.value, focusedIndex, true);
  }, [focusedIndex, focusedName, visibleRoutes.length]);

  useEffect(() => {
    if (hidden) {
      opacity.value = withTiming(0, { duration: FADE_MS });
      translateY.value = withTiming(12, { duration: FADE_MS });
      // Wait out the stack push before dropping height so ScreenContentWrapper
      // isn't left with a null child mid-draw on Android.
      const timeout = setTimeout(() => setMounted(false), 450);
      return () => clearTimeout(timeout);
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

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  if (!mounted) {
    return (
      <View collapsable={false} pointerEvents="none" style={{ height: 0 }} />
    );
  }

  return (
    <Animated.View
      collapsable={false}
      pointerEvents={hidden ? "none" : "auto"}
      style={[animatedStyle, { backgroundColor: sideChrome, zIndex: 30 }]}
    >
      {/* Inset to the page sheet; page bg fills the radius cutouts ("fake corners"). */}
      <View
        style={{
          marginHorizontal: SIDE_GUTTER,
          backgroundColor: pageBackground,
        }}
      >
        <View
          style={{
            backgroundColor: footerColor,
            borderTopLeftRadius: TAB_TOP_RADIUS,
            borderTopRightRadius: TAB_TOP_RADIUS,
            overflow: "hidden",
          }}
        >
          <View
            className="relative flex-row items-start"
            onLayout={onRowLayout}
          >
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: INDICATOR_WIDTH,
                  height: INDICATOR_HEIGHT,
                  borderRadius: INDICATOR_HEIGHT / 2,
                  backgroundColor: indicatorColor,
                  zIndex: 2,
                },
                indicatorStyle,
              ]}
            />
            {visibleRoutes.map((route) => {
              const isFocused = route.name === focusedName;
              const label = getTabLabel(route.name);
              const accessibilityLabel = getTabAccessibilityLabel(route.name);

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
                  label={label}
                  accessibilityLabel={accessibilityLabel}
                  bottomInset={insets.bottom}
                />
              );
            })}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
