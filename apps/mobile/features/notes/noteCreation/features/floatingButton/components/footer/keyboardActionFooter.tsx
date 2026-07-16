import React from "react";
import { StyleSheet, View } from "react-native";
import { interpolate, useAnimatedStyle } from "react-native-reanimated";
import {
  KeyboardStickyView,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";

const FOOTER_PADDING_Y = 10;
/** Must match FloatingModal expanded bottom gap. */
const MODAL_BOTTOM_GAP = 4;
/**
 * Extra popover fill that extends under the keyboard so tracking slip
 * never flashes the system/white background.
 */
const KEYBOARD_OVERLAP = 48;

type KeyboardActionFooterProps = {
  children: React.ReactNode;
  /** Height of the button row only (excludes safe-area / keyboard overlap fill). */
  onContentHeightChange?: (height: number) => void;
};

export const KEYBOARD_ACTION_FOOTER_PADDING_Y = FOOTER_PADDING_Y;
/** Popover fill that extends under the keyboard — not part of content occlusion. */
export const KEYBOARD_ACTION_FOOTER_KEYBOARD_OVERLAP = KEYBOARD_OVERLAP;

export function KeyboardActionFooter({
  children,
  onContentHeightChange,
}: KeyboardActionFooterProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const { progress } = useReanimatedKeyboardAnimation();
  const popoverColor = hsl("popover", colorScheme);

  // Closed: clear the home indicator. Open: tuck popover color under the keyboard.
  const safePadStyle = useAnimatedStyle(() => ({
    paddingBottom: interpolate(
      progress.value,
      [0, 1],
      [insets.bottom, KEYBOARD_OVERLAP]
    ),
  }));

  return (
    <KeyboardStickyView
      pointerEvents="box-none"
      offset={{
        closed: 0,
        // Keep the button flush with the keyboard; overlap hangs below it.
        opened: MODAL_BOTTOM_GAP + KEYBOARD_OVERLAP + 1,
      }}
      style={[
        styles.footer,
        safePadStyle,
        {
          backgroundColor: popoverColor,
          borderTopColor: hsl("input", colorScheme),
          borderTopWidth: 1,
        },
      ]}
    >
      <View
        style={styles.content}
        onLayout={(event) => {
          onContentHeightChange?.(event.nativeEvent.layout.height);
        }}
      >
        {children}
      </View>
    </KeyboardStickyView>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
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
