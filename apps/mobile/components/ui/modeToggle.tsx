import React, { useEffect } from "react";
import { Pressable, LayoutChangeEvent } from "react-native";
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

const ModeToggle = ({ onToggle, currentMode, values }: ModeToggleProps) => {
  const containerWidth = useSharedValue(0);
  const transition = useSharedValue(currentMode === values.first.name ? 0 : 1);

  useEffect(() => {
    transition.value = withSpring(currentMode === values.first.name ? 0 : 1, {
      damping: 50,
      stiffness: 400,
    });
  }, [currentMode]);

  const onLayout = (event: LayoutChangeEvent) => {
    containerWidth.value = event.nativeEvent.layout.width;
  };

  const handlePress = () => {
    const nextMode =
      currentMode === values.first.name
        ? values.second.name
        : values.first.name;
    onToggle(nextMode);
  };

  const sliderStyle = useAnimatedStyle(() => {
    const moveRange = containerWidth.value * 0.46; // Adjusted for the 54% width
    return {
      transform: [{ translateX: transition.value * moveRange }],
    };
  });

  // Animation for the Left Icon
  const leftIconStyle = useAnimatedStyle(() => {
    const scale = interpolate(transition.value, [0, 1], [1.1, 0.9]);
    const opacity = interpolate(transition.value, [0, 1], [1, 0.5]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Animation for the Right Icon
  const rightIconStyle = useAnimatedStyle(() => {
    const scale = interpolate(transition.value, [0, 1], [0.85, 0.9]);
    const opacity = interpolate(transition.value, [0, 1], [0.5, 1]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Pressable
      className="w-[90] relative h-[36] border-border border-solid border-[1px] overflow-hidden bg-card rounded-full flex-row items-center justify-between"
      onPress={handlePress}
      onLayout={onLayout}
    >
      {/* The Sliding Background */}
      <Animated.View
        className="absolute w-[54%] h-full bg-border border-solid border-[3px] border-card rounded-full"
        style={sliderStyle}
      />

      {/* Left Icon Container */}
      <Animated.View
        style={[
          leftIconStyle,
          { flex: 1, alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Icon
          size={20}
          name={values.first.icon}
          color="foreground"
          //   opacity={currentMode === icons.first ? 100 : 50}
        />
      </Animated.View>

      {/* Right Icon Container */}
      <Animated.View
        style={[
          rightIconStyle,
          { flex: 1, alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Icon
          size={20}
          name={values.second.icon}
          color="foreground"
          //   opacity={currentMode === icons.second ? 100 : 50}
        />
      </Animated.View>
    </Pressable>
  );
};

export default ModeToggle;
