import { useState } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";

type Props = {
  initialName?: string;
  placeholder?: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
};

/**
 * Custom modal body with a single text input + confirm/cancel buttons.
 * Use as the `customContent` of `useModal().openModal`.
 */
export const WorkspaceNameInputModal = ({
  initialName = "",
  placeholder = "Workspace name",
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: Props) => {
  const [value, setValue] = useState(initialName);
  const trimmed = value.trim();

  return (
    <View className="flex-col gap-4">
      {description && <Typography variant="muted">{description}</Typography>}
      <Input
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        autoFocus
        autoCapitalize="words"
        returnKeyType="done"
        onSubmitEditing={() => {
          if (trimmed) onConfirm(trimmed);
        }}
      />
      <View className="flex-row justify-end gap-2 mt-2">
        <Button variant="default" onPress={onCancel}>
          <Typography>{cancelLabel}</Typography>
        </Button>
        <Button
          variant="default"
          disabled={!trimmed}
          onPress={() => onConfirm(trimmed)}
        >
          <Typography>{confirmLabel}</Typography>
        </Button>
      </View>
    </View>
  );
};
