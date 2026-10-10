import { View } from "react-native";
import { Button } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import {
  EditNoteSaveAccessibilityLabel,
  getDiscardNoteAccessibilityLabel,
} from "@/features/notes/noteDetails/noteDetailsLabels";

type NoteEditorHeaderActionsProps = {
  onConfirm: () => void;
  onDeny: () => void;
  disabled?: boolean;
  confirmDisabled?: boolean;
  /** Preview/new delete the note; editing an existing note discards edits. */
  denyVariant?: "delete" | "discard";
};

export function NoteEditorHeaderActions({
  onConfirm,
  onDeny,
  disabled,
  confirmDisabled,
  denyVariant = "discard",
}: NoteEditorHeaderActionsProps) {
  return (
    <View className="flex-row items-center gap-2 ml-2" collapsable={false}>
      <Button
        variant="ghost"
        size="icon"
        cornerRadius="full"
        onPress={onConfirm}
        disabled={disabled || confirmDisabled}
        accessibilityRole="button"
        accessibilityLabel={EditNoteSaveAccessibilityLabel()}
      >
        <Icon name="circle-check" color="primary" size={38} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        cornerRadius="full"
        onPress={onDeny}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={getDiscardNoteAccessibilityLabel(denyVariant)}
      >
        <Icon name="circle-x" color="foreground-errors" size={38} />
      </Button>
    </View>
  );
}
