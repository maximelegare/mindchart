import React, { useEffect, useMemo, useRef } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { cn } from "@/lib/cn";

/** Matches folder-tree / notes long-press menus. */
export const LONG_PRESS_MS = 400;
/** Allow small finger jitter without canceling (RN Pressable is much stricter). */
const LONG_PRESS_MAX_DISTANCE = 24;

type LongPressableProps = {
  onPress?: () => void;
  onLongPress?: () => void;
  delayLongPress?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

/**
 * Tap + long-press via RNGH so ScrollView micro-movements don’t reset the timer
 * (common on the graph infos panel with RN Pressable).
 */
export function LongPressable({
  onPress,
  onLongPress,
  delayLongPress = LONG_PRESS_MS,
  className,
  style,
  children,
}: LongPressableProps) {
  const onPressRef = useRef(onPress);
  const onLongPressRef = useRef(onLongPress);

  useEffect(() => {
    onPressRef.current = onPress;
    onLongPressRef.current = onLongPress;
  }, [onPress, onLongPress]);

  const gesture = useMemo(() => {
    const firePress = () => onPressRef.current?.();
    const fireLongPress = () => onLongPressRef.current?.();

    const longPress = Gesture.LongPress()
      .minDuration(delayLongPress)
      .maxDistance(LONG_PRESS_MAX_DISTANCE)
      .onStart(() => {
        runOnJS(fireLongPress)();
      });

    const tap = Gesture.Tap().onEnd(() => {
      runOnJS(firePress)();
    });

    // Long-press wins when held; quick release is a tap.
    return Gesture.Exclusive(longPress, tap);
  }, [delayLongPress]);

  return (
    <GestureDetector gesture={gesture}>
      <View className={cn("shrink-0", className)} style={style}>
        {children}
      </View>
    </GestureDetector>
  );
}
