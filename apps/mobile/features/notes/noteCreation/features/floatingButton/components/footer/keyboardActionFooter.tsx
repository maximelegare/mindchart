import React from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";

const FOOTER_PADDING_Y = 8;
// const KEYBOARD_GAP = 12;
const MODAL_BOTTOM_GAP = 8;

type KeyboardActionFooterProps = {
  children: React.ReactNode;
};

export const KEYBOARD_ACTION_FOOTER_PADDING_Y = FOOTER_PADDING_Y;

export function KeyboardActionFooter({ children }: KeyboardActionFooterProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();

  // Modal bottom sits above the screen edge; compensate so the footer tracks
  // the keyboard instead of overshooting by that inset.
  const modalBottomInset = insets.bottom + MODAL_BOTTOM_GAP;

  return (
    <KeyboardStickyView
      pointerEvents="box-none"
      offset={{
        closed: 0,
        opened: modalBottomInset + 5,
      }}
      style={[
        styles.footer,
        {
          backgroundColor: hsl("popover", colorScheme),
          borderTopColor: hsl("input", colorScheme),
          borderTopWidth: 1,
        },
      ]}
    >
      <View style={styles.content}>{children}</View>
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
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
});
