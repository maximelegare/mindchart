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
    scale.value = withSpring(isFocused ? 1 : 0, { duration: 350 });
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(scale.value, [0, 1], [1, 1.2]) }],
      top: interpolate(scale.value, [0, 1], [0, 6]),
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scale.value, [0, 1], [1, 0]),
  }));

  return (
    <Pressable
      onPress={onPress}
      className="items-center justify-center flex-1 h-full py-1"
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
        {label}
      </Animated.Text>
    </Pressable>
  );
};
