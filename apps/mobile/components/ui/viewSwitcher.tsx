import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  SlideInRight,
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight,
} from "react-native-reanimated";

interface ViewSwitcherProps {
  currentMode: string;
  firstMode: string;
  firstComponent: React.ReactNode;
  secondComponent: React.ReactNode;
}

const ViewSwitcher = ({
  currentMode,
  firstMode,
  firstComponent,
  secondComponent,
}: ViewSwitcherProps) => {
  const isFirst = currentMode === firstMode;

  return (
    <View style={styles.container}>
      {isFirst ? (
        <Animated.View
          key="view-1" // Use a static key for the slot
          entering={SlideInRight.duration(300)}
          exiting={SlideOutRight.duration(300)}
          style={styles.full}
        >
          {firstComponent}
        </Animated.View>
      ) : (
        <Animated.View
          key="view-2" // Use a static key for the slot
          entering={SlideInLeft.duration(300)}
          exiting={SlideOutLeft.duration(300)}
          style={styles.full}
        >
          {secondComponent}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1, // Important: Give it a height or flex: 1
    position: "relative",
    overflow: "hidden",
  },
  full: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default ViewSwitcher;
