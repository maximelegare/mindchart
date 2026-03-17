import { cn } from "@/lib/cn";
import { Pressable } from "react-native";
import { tabIconMap } from "./icons.map";
import { Icon } from "@/components/ui/icons/icon";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useEffect } from "react";

type TabBarButtonProps = {
  routeName: string;
  onPress: () => void;
  isFocused: boolean;
  label: string;
};

export const TabBarButton = ({
  routeName,
  onPress,
  isFocused,
  label,
}: TabBarButtonProps) => {
  const scale = useSharedValue(0);
  useEffect(() => {
    scale.value = withSpring(
      typeof isFocused === "boolean" ? (isFocused ? 1 : 0) : isFocused,
      { duration: 350 }
    );
  }, [scale, isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2]);

    const top = interpolate(scale.value, [0, 1], [0, 6]);
    return {
      transform: [{ scale: scaleValue }],
      top,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scale.value, [0, 1], [1, 0]),
  }));

  return (
    <Pressable
      onPress={onPress}
      className={cn("items-center justify-center w-24 py-1  rounded-[18px]")}
    >
      <Animated.View style={animatedIconStyle}>
        <Icon
          name={tabIconMap[routeName]}
          color={isFocused ? "text" : "border"}
        />
      </Animated.View>
      <Animated.Text
        className={cn("text-xs", isFocused ? "text-foreground" : "text-border")}
        style={[animatedTextStyle, { fontFamily: "QuicksandRegular" }]}
      >
        {label as string}
      </Animated.Text>
    </Pressable>
  );
};
