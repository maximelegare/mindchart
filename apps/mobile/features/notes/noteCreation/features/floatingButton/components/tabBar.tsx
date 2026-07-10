import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Icon } from "@/components/ui/icons/icon";
import { cn } from "@/lib/cn";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { FloatingModalTab, FloatingModalTabId } from "../types/types";

const TAB_BAR_HEIGHT = 48;
const TAB_WIDTH = 56;
const ICON_SIZE = 18;
const TRACK_PADDING = 2;
const springConfig = { duration: 350 };

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
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1 : 0, springConfig);
  }, [isActive, scale]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(scale.value, [0, 1], [1, 1.15]) }],
    top: interpolate(scale.value, [0, 1], [0, 4]),
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scale.value, [0, 1], [1, 0]),
  }));

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
          color={isActive ? "text" : "border"}
        />
      </Animated.View>
      <Animated.Text
        className={cn(
          "leading-3",
          isActive ? "text-foreground" : "text-border"
        )}
        style={[
          animatedTextStyle,
          { fontFamily: "QuicksandRegular", fontSize: 8 },
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

  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const trackColor = hsl("popover", colorScheme);

  const onTabBarLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setTrackWidth(width);
    tabPositionX.value = withSpring(activeIndex * TAB_WIDTH, springConfig);
  };

  useEffect(() => {
    if (trackWidth > 0) {
      tabPositionX.value = withSpring(activeIndex * TAB_WIDTH, springConfig);
    }
  }, [activeIndex, tabPositionX, trackWidth]);

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
