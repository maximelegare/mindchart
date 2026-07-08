import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icons/icon";
import { cn } from "@/lib/cn";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { FloatingModalTab, FloatingModalTabId } from "../types/types";

const TAB_BAR_HEIGHT = 36;
const TRACK_PADDING = 3;
const INDICATOR_BORDER = 1;
const springConfig = { duration: 350 };

type FloatingModalTabBarProps = {
  tabs: FloatingModalTab[];
  activeTab: FloatingModalTabId;
  onTabChange: (tabId: FloatingModalTabId) => void;
};

export const FloatingModalTabBar = ({
  tabs,
  activeTab,
  onTabChange,
}: FloatingModalTabBarProps) => {
  const { colorScheme } = useColorScheme();
  const [tabWidth, setTabWidth] = useState(0);
  const tabPositionX = useSharedValue(0);

  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const trackColor = hsl("popover", colorScheme);
  const indicatorColor = hsl("border", colorScheme);
  const indicatorBorderColor = hsl("border", colorScheme);

  const onTabBarLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    const nextTabWidth = width / tabs.length;
    setTabWidth(nextTabWidth);
    tabPositionX.value = withSpring(activeIndex * nextTabWidth, springConfig);
  };

  useEffect(() => {
    if (tabWidth > 0) {
      tabPositionX.value = withSpring(activeIndex * tabWidth, springConfig);
    }
  }, [activeIndex, tabWidth, tabPositionX]);

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
      className="flex-1"
    >
      <View
        onLayout={onTabBarLayout}
        className="relative flex-row flex-1 h-full"
      >
        {tabWidth > 0 && (
          <Animated.View
            style={[indicatorStyle, { width: tabWidth }]}
            className="absolute h-full"
          >
            <View
              style={{
                flex: 1,
                backgroundColor: indicatorColor,
                borderRadius: (TAB_BAR_HEIGHT - TRACK_PADDING * 2) / 2,
                borderWidth: INDICATOR_BORDER,
                borderColor: indicatorBorderColor,
              }}
            />
          </Animated.View>
        )}

        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <Pressable
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              className="flex-1 flex-row items-center justify-center gap-1 h-full"
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Icon
                name={tab.icon}
                size={14}
                color={isActive ? "foreground" : "input"}
              />
              <Typography
                variant="small"
                className={cn(
                  "text-xs",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {tab.label}
              </Typography>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
