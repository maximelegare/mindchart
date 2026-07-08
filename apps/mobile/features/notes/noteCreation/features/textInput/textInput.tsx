import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import React, { useRef, useEffect } from "react";
import { View, TextInput } from "react-native";

export const TextInputFeature = ({
  onChange,
  value,
}: {
  onChange: (text: string) => void;
  value: string;
}) => {
  const { colorScheme } = useColorScheme();
  const textareaRef = useRef<TextInput>(null);

  useEffect(() => {
    // Focus the textarea when component mounts and open keyboard
    // Small delay ensures the component is fully mounted
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 h-full w-full">
      <Label className="text-popover-foreground" nativeID="topic">
        Content
      </Label>
      <Textarea
        ref={textareaRef}
        placeholder="What do you have in mind?"
        style={{ height: 300, backgroundColor: hsl("card", colorScheme) }}
        onChangeText={onChange}
        value={value}
        multiline={true}
      />
    </View>
  );
};
