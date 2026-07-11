import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";

const FOOTER_PADDING_Y = 8;
const FOOTER_JUMP_MS = 60;
const KEYBOARD_GAP = 12;
const MODAL_BOTTOM_GAP = 8;

const jumpConfig = {
  duration: FOOTER_JUMP_MS,
  easing: Easing.out(Easing.quad),
};

type KeyboardActionFooterProps = {
  keyboardHeight?: number;
  children: React.ReactNode;
};

export const KEYBOARD_ACTION_FOOTER_PADDING_Y = FOOTER_PADDING_Y;

export function KeyboardActionFooter({
  keyboardHeight = 0,
  children,
}: KeyboardActionFooterProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const footerBottom = useSharedValue(0);

  // Modal bottom sits just above the safe area (covers the tab bar).
  const modalBottomInset = insets.bottom + MODAL_BOTTOM_GAP - 10;

  useEffect(() => {
    const targetBottom =
      keyboardHeight > 0
        ? Math.max(
            KEYBOARD_GAP,
            keyboardHeight - modalBottomInset + KEYBOARD_GAP
          )
        : 0;

    footerBottom.value = withTiming(targetBottom, jumpConfig);
  }, [footerBottom, keyboardHeight, modalBottomInset]);

  const footerStyle = useAnimatedStyle(() => ({
    bottom: footerBottom.value,
  }));

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.footer,
        footerStyle,
        {
          backgroundColor: hsl("popover", colorScheme),
          borderTopColor: hsl("input", colorScheme),
          borderTopWidth: 1,
        },
      ]}
    >
      <View style={styles.content}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 20,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: FOOTER_PADDING_Y,
    paddingHorizontal: 8,
  },
});
