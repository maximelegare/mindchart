import * as React from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { cn } from "@/lib/cn";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";

const duration = 1100;
const easing = Easing.inOut(Easing.quad);
const MIN_OPACITY = 0.32;
const MAX_OPACITY = 0.46;

function Skeleton({
  className,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof Animated.View>, "style">) {
  const { colorScheme } = useColorScheme();
  const sv = useSharedValue(MAX_OPACITY);

  React.useEffect(() => {
    sv.value = withRepeat(
      withSequence(
        withTiming(MIN_OPACITY, { duration, easing }),
        withTiming(MAX_OPACITY, { duration, easing })
      ),
      -1
    );
  }, [sv]);

  const style = useAnimatedStyle(() => ({
    opacity: sv.value,
  }));

  return (
    <Animated.View
      style={[{ backgroundColor: hsl("muted-foreground", colorScheme) }, style]}
      className={cn("rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
