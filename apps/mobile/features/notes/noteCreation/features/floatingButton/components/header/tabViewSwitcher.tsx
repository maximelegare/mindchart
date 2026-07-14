import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { FloatingModalTab, FloatingModalTabId } from "../../types/types";

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
  const [displayedTab, setDisplayedTab] = useState(activeTab);
  const opacity = useSharedValue(0);
  const generationRef = useRef(0);

  const handleFadeOutComplete = useCallback(
    (nextTab: FloatingModalTabId, generation: number) => {
      if (generation !== generationRef.current) return;
      setDisplayedTab(nextTab);
    },
    []
  );

  useEffect(() => {
    const generation = ++generationRef.current;

    if (activeTab === displayedTab) {
      opacity.value = withTiming(1, { duration: fadeMs });
      return;
    }

    const nextTab = activeTab;
    opacity.value = withTiming(0, { duration: fadeMs }, (finished) => {
      if (!finished) return;
      runOnJS(handleFadeOutComplete)(nextTab, generation);
    });
  }, [activeTab, displayedTab, fadeMs, handleFadeOutComplete, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const displayedTabConfig = tabs.find((tab) => tab.id === displayedTab);
  const displayedContent = displayedTabConfig?.render();

  if (!displayedContent) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.panel, animatedStyle]}>
        <View key={displayedTab} style={styles.panel}>
          {displayedContent}
        </View>
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
