import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui";

type DiscardNoteButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  /** Preview uses "Delete"; editing an existing note uses "Discard". */
  label?: "Delete" | "Discard";
};

export function DiscardNoteButton({
  onPress,
  disabled,
  label = "Discard",
}: DiscardNoteButtonProps) {
  return (
    <Button
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label === "Delete" ? "Delete note" : "Discard note"}
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
        {label}
      </Typography>
    </Button>
  );
}
