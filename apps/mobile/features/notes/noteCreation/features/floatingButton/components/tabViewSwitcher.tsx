import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { FloatingModalTab, FloatingModalTabId } from "../types/types";

const TAB_FADE_MS = 150;

type TabViewSwitcherProps = {
  tabs: FloatingModalTab[];
  activeTab: FloatingModalTabId;
  fadeMs?: number;
};

export const TabViewSwitcher = ({
  tabs,
  activeTab,
  fadeMs = TAB_FADE_MS,
}: TabViewSwitcherProps) => {
  const opacity = useSharedValue(0);
  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  useEffect(() => {
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: fadeMs });
  }, [activeTab, fadeMs, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!activeContent) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Animated.View key={activeTab} style={[styles.panel, animatedStyle]}>
        {activeContent}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  panel: {
    ...StyleSheet.absoluteFillObject,
    overflow: "visible",
  },
});
