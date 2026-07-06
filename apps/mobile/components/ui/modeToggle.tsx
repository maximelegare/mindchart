import React, { useEffect, useRef } from "react";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { IconName } from "./icons/icon-registry";
import { Icon } from "./icons/icon";

interface ModeToggleProps {
  onToggle: (mode: string) => void;
  currentMode: string;
  values: {
    first: { name: string; icon: IconName };
    second: { name: string; icon: IconName };
  };
}

const TOGGLE_WIDTH = 90;
const SLIDE_RANGE = TOGGLE_WIDTH * 0.46;
const springConfig = { damping: 50, stiffness: 400 };

const ModeToggle = ({ onToggle, currentMode, values }: ModeToggleProps) => {
  const visualModeRef = useRef(currentMode);
  const transition = useSharedValue(currentMode === values.first.name ? 0 : 1);

  const animateToMode = (mode: string) => {
    transition.value = withSpring(
      mode === values.first.name ? 0 : 1,
      springConfig
    );
  };

  // Sync only external mode changes (deep links, navigation). Never overwrites a local press.
  useEffect(() => {
    if (currentMode === visualModeRef.current) return;
    visualModeRef.current = currentMode;
    animateToMode(currentMode);
  }, [currentMode]);

  const handlePress = () => {
    const nextMode =
      visualModeRef.current === values.first.name
        ? values.second.name
        : values.first.name;

    visualModeRef.current = nextMode;
    animateToMode(nextMode);

    setTimeout(() => onToggle(nextMode), 0);
  };

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: transition.value * SLIDE_RANGE }],
  }));

  const leftIconStyle = useAnimatedStyle(() => {
    const scale = interpolate(transition.value, [0, 1], [1.1, 0.9]);
    const opacity = interpolate(transition.value, [0, 1], [1, 0.5]);
    return { transform: [{ scale }], opacity };
  });

  const rightIconStyle = useAnimatedStyle(() => {
    const scale = interpolate(transition.value, [0, 1], [0.85, 0.9]);
    const opacity = interpolate(transition.value, [0, 1], [0.5, 1]);
    return { transform: [{ scale }], opacity };
  });

  return (
    <Pressable
      className="w-[90] relative h-[36] border-border border-solid border-[1px] overflow-hidden bg-card rounded-full flex-row items-center justify-between"
      onPress={handlePress}
    >
      <Animated.View
        className="absolute w-[54%] h-full bg-border border-solid border-[3px] border-card rounded-full"
        style={sliderStyle}
      />

      <Animated.View
        style={[
          leftIconStyle,
          { flex: 1, alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Icon size={20} name={values.first.icon} color="foreground" />
      </Animated.View>

      <Animated.View
        style={[
          rightIconStyle,
          { flex: 1, alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Icon size={20} name={values.second.icon} color="foreground" />
      </Animated.View>
    </Pressable>
  );
};

export default ModeToggle;
