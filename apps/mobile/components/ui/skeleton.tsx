import * as React from "react";
import { View, type ViewProps } from "react-native";
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

/** One shared pulse for a group of bones — avoids N independent Reanimated loops. */
function SkeletonPulse({
  children,
  ...props
}: ViewProps & { children: React.ReactNode }) {
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
    <Animated.View {...props} style={style}>
      {children}
    </Animated.View>
  );
}

function Skeleton({
  className,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof View>, "style">) {
  const { colorScheme } = useColorScheme();

  return (
    <View
      style={{ backgroundColor: hsl("muted-foreground", colorScheme) }}
      className={cn("rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton, SkeletonPulse };
