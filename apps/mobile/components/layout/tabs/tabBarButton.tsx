import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { tabIconMap } from "./icons.map";
import { Icon } from "@/components/ui/icons/icon";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { LAYOUT_SIZES } from "../constants";

/** How far the ripple extends past each side of the button. */
const RIPPLE_SIDE_OVERLAP = 0.12;
const RIPPLE_EXPAND_MS = 280;
const RIPPLE_FADE_MS = 220;

type TabBarButtonProps = {
  routeName: string;
  onPress: () => void;
  isFocused: boolean;
  label: string;
  bottomInset: number;
};

export const TabBarButton = ({
  routeName,
  onPress,
  isFocused,
  label,
  bottomInset,
}: TabBarButtonProps) => {
  const { colorScheme } = useColorScheme();
  const [isRippling, setIsRippling] = useState(false);
  const rippleProgress = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  const rippleColor = hsl("muted-foreground", colorScheme);

  const endRipple = () => {
    setIsRippling(false);
  };

  const playRipple = () => {
    setIsRippling(true);
    rippleProgress.value = 0;
    rippleOpacity.value = 0.22;
    rippleProgress.value = withTiming(1, {
      duration: RIPPLE_EXPAND_MS,
      easing: Easing.out(Easing.cubic),
    });
    rippleOpacity.value = withTiming(
      0,
      {
        duration: RIPPLE_EXPAND_MS + RIPPLE_FADE_MS,
        easing: Easing.out(Easing.quad),
      },
      (finished) => {
        if (finished) {
          runOnJS(endRipple)();
        }
      }
    );
  };

  const handlePress = () => {
    playRipple();
    onPress();
  };

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: rippleOpacity.value,
    transform: [
      {
        scaleX: 0.55 + rippleProgress.value * 0.45,
      },
    ],
  }));

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.pressable,
        { height: LAYOUT_SIZES.TAB_BAR_HEIGHT + bottomInset },
        isRippling && styles.pressableActive,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
    >
      <View style={styles.rippleHost} pointerEvents="none">
        <Animated.View
          style={[
            styles.ripple,
            {
              backgroundColor: rippleColor,
              width: `${(1 + RIPPLE_SIDE_OVERLAP * 2) * 100}%`,
            },
            rippleStyle,
          ]}
        />
      </View>

      <View style={[styles.content, { height: LAYOUT_SIZES.TAB_BAR_HEIGHT }]}>
        <Icon
          name={tabIconMap[routeName]}
          color={isFocused ? "text" : "muted-foreground"}
          hslColor={isFocused ? "#ffffff" : undefined}
        />
        <Text
          className={
            isFocused ? "text-xs text-white" : "text-xs text-muted-foreground"
          }
          style={{ fontFamily: "QuicksandRegular" }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    overflow: "visible",
    zIndex: 1,
  },
  pressableActive: {
    zIndex: 2,
  },
  rippleHost: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  ripple: {
    height: "100%",
    borderRadius: 0,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    zIndex: 1,
  },
});
