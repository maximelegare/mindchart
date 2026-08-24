import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui";
import {
  DiscardNoteDeleteLabel,
  DiscardNoteDiscardLabel,
  getDiscardNoteAccessibilityLabel,
} from "@/features/notes/noteDetails/noteDetailsLabels";

type DiscardNoteButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  /** Preview uses delete; editing an existing note uses discard. */
  variant?: "delete" | "discard";
};

export function DiscardNoteButton({
  onPress,
  disabled,
  variant = "discard",
}: DiscardNoteButtonProps) {
  return (
    <Button
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={getDiscardNoteAccessibilityLabel(variant)}
      className="h-7 flex-row items-center gap-1"
      variant="destructive"
      size="sm"
      cornerRadius="full"
    >
      <Icon name="trash-2" size={12} color="destructive-foreground" />
      <Typography
        variant="small"
        className="text-xs font-semibold text-destructive-foreground"
        padding={false}
      >
        {variant === "delete" ? (
          <DiscardNoteDeleteLabel />
        ) : (
          <DiscardNoteDiscardLabel />
        )}
      </Typography>
    </Button>
  );
}
