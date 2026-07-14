import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import React, { useEffect, useRef } from "react";
import { View, TextInput } from "react-native";
import {
  GENERATE_NOTE_BUTTON_HEIGHT,
  GENERATE_NOTE_BUTTON_MARGIN,
} from "@/features/notes/noteCreation/features/generateNote/components/index";

export const TextInputFeature = ({
  onChange,
  value,
  keyboardHeight = 0,
}: {
  onChange: (text: string) => void;
  value: string;
  keyboardHeight?: number;
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
    <View className="relative min-h-0 w-full flex-1 flex-col gap-2">
      <Label className="mb-0 shrink-0 text-popover-foreground" nativeID="topic">
        Content
      </Label>

      <View
        className="min-h-0 flex-1"
        style={{
          paddingBottom:
            keyboardHeight > 0
              ? 0
              : GENERATE_NOTE_BUTTON_HEIGHT + GENERATE_NOTE_BUTTON_MARGIN * 2,
        }}
      >
        <Textarea
          ref={textareaRef}
          placeholder="What do you have in mind?"
          className="h-full"
          style={{
            flex: 1,
            backgroundColor: hsl("card", colorScheme),
          }}
          onChangeText={onChange}
          value={value}
          multiline={true}
        />
      </View>
    </View>
  );
};
