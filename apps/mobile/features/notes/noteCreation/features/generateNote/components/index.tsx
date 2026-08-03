import { Icon } from "@/components/ui/icons/icon";
import { TouchableOpacity, View } from "react-native";
import { Typography } from "@/components/ui/typography";
import React from "react";
import { Gradient } from "@/components/ui/gradient";
import { cn } from "@/lib/cn";
import { useColorScheme } from "@/lib/useColorScheme";
import { useGenerateNoteAction } from "@/features/notes/noteCreation/features/generateNote/hooks/useGenerateNoteAction";

const SIZE_STYLES = {
  sm: { height: 36, paddingHorizontal: 12, icon: 14, gap: 6 },
  md: { height: 48, paddingHorizontal: 20, icon: 18, gap: 8 },
} as const;

export const GenerateNote = ({
  fileURI,
  inputText,
  currentView,
  onSuccess,
  size = "sm",
}: {
  fileURI: string | null;
  inputText: string;
  currentView: "audio" | "input";
  onSuccess?: () => void;
  size?: "sm" | "md";
}) => {
  const { colorScheme } = useColorScheme();
  const { generateNote, isDisabled } = useGenerateNoteAction({
    fileURI,
    inputText,
    currentView,
    onSuccess,
  });

  const dimensions = SIZE_STYLES[size];

  return (
    <TouchableOpacity
      onPress={generateNote}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel="Generate note"
      activeOpacity={0.85}
      className={cn(
        "overflow-hidden rounded-full border border-border",
        isDisabled && "bg-muted/50"
      )}
      style={{
        height: dimensions.height,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {!isDisabled && (
        <Gradient theme={colorScheme} variant="primary" className="absolute" />
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: dimensions.gap,
          paddingHorizontal: dimensions.paddingHorizontal,
        }}
      >
        <Icon
          name="sparkles"
          size={dimensions.icon}
          color={isDisabled ? "border" : "background"}
        />
        <Typography
          className={cn(
            isDisabled ? "text-border" : "text-background",
            "font-bold text-center",
            size === "md" ? "text-base" : "text-sm"
          )}
        >
          Generate Note
        </Typography>
      </View>
    </TouchableOpacity>
  );
};
