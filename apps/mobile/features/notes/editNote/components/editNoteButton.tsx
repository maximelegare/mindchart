import React from "react";
import { Button } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import {
  EditNoteEditAccessibilityLabel,
  EditNoteSaveAccessibilityLabel,
} from "@/features/notes/noteDetails/noteDetailsLabels";

type EditNoteButtonProps = {
  isEditing: boolean;
  onPress: () => void;
  disabled?: boolean;
};

export const EditNoteButton = ({
  isEditing,
  onPress,
  disabled,
}: EditNoteButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      accessibilityLabel={
        isEditing
          ? EditNoteSaveAccessibilityLabel()
          : EditNoteEditAccessibilityLabel()
      }
      onPress={onPress}
      disabled={disabled}
    >
      <Icon
        name={isEditing ? "save" : "pencil"}
        size={22}
        color="popover-foreground"
      />
    </Button>
  );
};
