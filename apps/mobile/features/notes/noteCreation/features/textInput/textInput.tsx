import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import React, { useEffect, useRef } from "react";
import { StyleSheet, View, TextInput } from "react-native";

export const TextInputFeature = ({
  onChange,
  value,
  keyboardHeight = 0,
  compact = false,
  overlay,
  overlayInset = 0,
}: {
  onChange: (text: string) => void;
  value: string;
  keyboardHeight?: number;
  compact?: boolean;
  /** Renders over the white input surface (e.g. Generate button). */
  overlay?: React.ReactNode;
  /** Extra bottom padding so text is never covered by the overlay. */
  overlayInset?: number;
}) => {
  const { colorScheme } = useColorScheme();
  const textareaRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      className="relative min-h-0 w-full flex-1 flex-col"
      style={{ gap: compact ? 4 : 8 }}
    >
      {!compact ? (
        <Label
          className="mb-0 shrink-0 text-popover-foreground"
          nativeID="topic"
        >
          Content
        </Label>
      ) : null}

      <View
        className="min-h-0 flex-1 overflow-hidden"
        style={{
          position: "relative",
          paddingBottom: keyboardHeight > 0 || compact ? 0 : 8,
        }}
      >
        <Textarea
          ref={textareaRef}
          placeholder="What do you have in mind?"
          className="h-full"
          style={{
            flex: 1,
            backgroundColor: hsl("card", colorScheme),
            paddingBottom: overlayInset > 0 ? overlayInset : undefined,
          }}
          onChangeText={onChange}
          value={value}
          multiline={true}
          textAlignVertical="top"
        />

        {overlay ? (
          <View pointerEvents="box-none" style={styles.overlay}>
            {overlay}
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    right: 12,
    bottom: 12,
  },
});
