import React, { useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, Pressable, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Icon } from "@/components/ui/icons/icon";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { FloatingModalTab, FloatingModalTabId } from "../../types/types";

const TAB_BAR_HEIGHT = 48;
const TAB_WIDTH = 56;
const ICON_SIZE = 18;
const TRACK_PADDING = 2;
const springConfig = { duration: 200 };

type FloatingModalTabBarProps = {
  tabs: FloatingModalTab[];
  activeTab: FloatingModalTabId;
  onTabChange: (tabId: FloatingModalTabId) => void;
};

type FloatingTabBarButtonProps = {
  tab: FloatingModalTab;
  isActive: boolean;
  onPress: () => void;
};

const FloatingTabBarButton = ({
  tab,
  isActive,
  onPress,
}: FloatingTabBarButtonProps) => {
  const { colorScheme } = useColorScheme();
  const scale = useSharedValue(isActive ? 1 : 0);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      scale.value = isActive ? 1 : 0;
      return;
    }

    scale.value = withSpring(isActive ? 1 : 0, springConfig);
  }, [isActive, scale]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(scale.value, [0, 1], [1, 1.15]) }],
    top: interpolate(scale.value, [0, 1], [0, 4]),
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scale.value, [0, 1], [1, 0]),
  }));

  // Active tab sits on the background pill; inactive tabs sit on the popover track.
  // Animated.Text ignores NativeWind text-* classes — set color explicitly.
  const labelColor = hsl(isActive ? "text" : "muted-foreground", colorScheme);

  return (
    <Pressable
      onPress={onPress}
      style={{ width: TAB_WIDTH }}
      className="h-full items-center justify-center"
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
    >
      <Animated.View style={animatedIconStyle}>
        <Icon
          name={tab.icon}
          size={ICON_SIZE}
          color={isActive ? "text" : "muted-foreground"}
        />
      </Animated.View>
      <Animated.Text
        className="leading-3"
        style={[
          animatedTextStyle,
          {
            color: labelColor,
            fontFamily: "QuicksandRegular",
            fontSize: 8,
          },
        ]}
      >
        {tab.label}
      </Animated.Text>
    </Pressable>
  );
};

export const FloatingModalTabBar = ({
  tabs,
  activeTab,
  onTabChange,
}: FloatingModalTabBarProps) => {
  const { colorScheme } = useColorScheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const tabPositionX = useSharedValue(0);
  const hasAnimatedIndicatorRef = useRef(false);

  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const trackColor = hsl("popover", colorScheme);

  const setIndicatorPosition = (index: number, animated: boolean) => {
    const nextX = index * TAB_WIDTH;
    if (animated) {
      tabPositionX.value = withSpring(nextX, springConfig);
      return;
    }
    tabPositionX.value = nextX;
  };

  const onTabBarLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setTrackWidth(width);
    setIndicatorPosition(activeIndex, hasAnimatedIndicatorRef.current);
    hasAnimatedIndicatorRef.current = true;
  };

  useEffect(() => {
    if (trackWidth <= 0) return;
    setIndicatorPosition(activeIndex, hasAnimatedIndicatorRef.current);
  }, [activeIndex, trackWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabPositionX.value }],
  }));

  return (
    <View
      style={{
        height: TAB_BAR_HEIGHT,
        backgroundColor: trackColor,
        padding: TRACK_PADDING,
        borderRadius: TAB_BAR_HEIGHT / 2,
      }}
      className="shrink-0 overflow-hidden"
    >
      <View
        onLayout={onTabBarLayout}
        className="relative h-full flex-row items-center"
      >
        {trackWidth > 0 && (
          <Animated.View
            style={[indicatorStyle, { width: TAB_WIDTH }]}
            className="absolute h-full"
          >
            <View className="h-full w-full rounded-2xl border-[3px] border-popover bg-background" />
          </Animated.View>
        )}

        {tabs.map((tab) => (
          <FloatingTabBarButton
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTab}
            onPress={() => onTabChange(tab.id)}
          />
        ))}
      </View>
    </View>
  );
};
