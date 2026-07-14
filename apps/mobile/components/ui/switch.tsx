import * as React from "react";
import { Platform, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import * as SwitchPrimitives from "@/components/primitives/switch";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";

import { cn } from "@/lib/cn";

export type SwitchColorProps = {
  trackColor?: string;
  trackCheckedColor?: string;
  thumbColor?: string;
};

type SwitchProps = React.ComponentPropsWithoutRef<
  typeof SwitchPrimitives.Root
> &
  SwitchColorProps;

const useSwitchColors = ({
  trackColor,
  trackCheckedColor,
  thumbColor,
}: SwitchColorProps) => {
  const { colorScheme } = useColorScheme();

  return {
    trackColor: trackColor ?? hsl("input", colorScheme),
    trackCheckedColor: trackCheckedColor ?? hsl("primary", colorScheme),
    thumbColor: thumbColor ?? hsl("background", colorScheme),
  };
};

const SwitchWeb = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(
  (
    {
      className,
      checked,
      trackColor,
      trackCheckedColor,
      thumbColor,
      style,
      ...props
    },
    ref
  ) => {
    const colors = useSwitchColors({
      trackColor,
      trackCheckedColor,
      thumbColor,
    });
    const hasCustomColors =
      trackColor != null || trackCheckedColor != null || thumbColor != null;

    return (
      <SwitchPrimitives.Root
        className={cn(
          "peer flex-row h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed",
          !hasCustomColors && (checked ? "bg-primary" : "bg-input"),
          props.disabled && "opacity-50",
          className
        )}
        style={[
          hasCustomColors
            ? {
                backgroundColor: checked
                  ? colors.trackCheckedColor
                  : colors.trackColor,
              }
            : undefined,
          style as StyleProp<ViewStyle>,
        ]}
        checked={checked}
        {...props}
        ref={ref}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full shadow-md shadow-foreground/5 ring-0 transition-transform",
            !hasCustomColors && "bg-background",
            checked ? "translate-x-5" : "translate-x-0"
          )}
          style={
            hasCustomColors ? { backgroundColor: colors.thumbColor } : undefined
          }
        />
      </SwitchPrimitives.Root>
    );
  }
);

SwitchWeb.displayName = "SwitchWeb";

const SwitchNative = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(
  (
    { className, checked, trackColor, trackCheckedColor, thumbColor, ...props },
    ref
  ) => {
    const colors = useSwitchColors({
      trackColor,
      trackCheckedColor,
      thumbColor,
    });
    const translateX = useDerivedValue(() => (checked ? 18 : 0));

    const animatedRootStyle = useAnimatedStyle(
      () => ({
        backgroundColor: interpolateColor(
          translateX.value,
          [0, 18],
          [colors.trackColor, colors.trackCheckedColor]
        ),
      }),
      [colors.trackColor, colors.trackCheckedColor]
    );

    const animatedThumbStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: withTiming(translateX.value, { duration: 200 }) },
      ],
    }));

    return (
      <Animated.View
        style={animatedRootStyle}
        className={cn(
          "h-8 w-[46px] rounded-full",
          props.disabled && "opacity-50"
        )}
      >
        <SwitchPrimitives.Root
          className={cn(
            "flex-row h-8 w-[46px] shrink-0 items-center rounded-full border-2 border-transparent",
            className
          )}
          checked={checked}
          {...props}
          ref={ref}
        >
          <Animated.View style={animatedThumbStyle}>
            <SwitchPrimitives.Thumb
              className="h-7 w-7 rounded-full shadow-md shadow-foreground/25 ring-0"
              style={{ backgroundColor: colors.thumbColor }}
            />
          </Animated.View>
        </SwitchPrimitives.Root>
      </Animated.View>
    );
  }
);
SwitchNative.displayName = "SwitchNative";

const Switch = Platform.select({
  web: SwitchWeb,
  default: SwitchNative,
});

export { Switch };
