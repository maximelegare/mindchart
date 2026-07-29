import React, { useEffect } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { cn } from "@/lib/cn";

const DEFAULT_WIDTH = 320;
const ANIMATION = { duration: 240, easing: Easing.out(Easing.cubic) };

export type SidebarProps = {
  open: boolean;
  onClose?: () => void;
  side?: "right" | "left";
  width?: number;
  children: React.ReactNode;
  /** Fixed header above the scrollable body. */
  header?: React.ReactNode;
  className?: string;
  /** Dimmed pressable overlay behind the panel. Defaults to true. */
  showBackdrop?: boolean;
};

/**
 * Absolute side panel that slides in over its parent.
 * Mount above chrome (e.g. tab bar) via a high-z overlay layer.
 */
export function Sidebar({
  open,
  onClose,
  side = "right",
  width = DEFAULT_WIDTH,
  children,
  header,
  className,
  showBackdrop = true,
}: SidebarProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { colorScheme } = useColorScheme();
  const panelWidth = Math.min(width, Math.round(windowWidth * 0.85));

  const progress = useSharedValue(open ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, ANIMATION);
  }, [open, progress]);

  const panelStyle = useAnimatedStyle(() => {
    const hiddenOffset = side === "right" ? panelWidth : -panelWidth;
    return {
      transform: [{ translateX: (1 - progress.value) * hiddenOffset }],
    };
  });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.45,
  }));

  const backgroundColor = hsl("background", colorScheme);
  const borderColor = hsl("border", colorScheme);

  return (
    <View
      pointerEvents={open ? "box-none" : "none"}
      style={StyleSheet.absoluteFill}
    >
      {showBackdrop ? (
        <Animated.View
          pointerEvents={open ? "auto" : "none"}
          style={[StyleSheet.absoluteFill, backdropStyle]}
          className="bg-black"
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
      ) : null}

      <Animated.View
        pointerEvents={open ? "auto" : "none"}
        style={[
          styles.panel,
          side === "right" ? styles.right : styles.left,
          {
            width: panelWidth,
            backgroundColor,
            borderColor,
            paddingTop: Math.max(insets.top, 12),
            paddingBottom: Math.max(insets.bottom, 12),
          },
          panelStyle,
        ]}
        className={cn("border-border", className)}
      >
        {header ? (
          <View className="shrink-0 px-2 pb-2 border-b border-border">
            {header}
          </View>
        ) : null}
        <View className="flex-1 min-h-0">{children}</View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  right: {
    right: 0,
    borderRightWidth: 0,
  },
  left: {
    left: 0,
    borderLeftWidth: 0,
  },
});
