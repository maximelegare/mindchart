import { StyleSheet } from "react-native";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";

type DiscardNoteButtonProps = {
  onPress: () => void;
  disabled?: boolean;
};

export function DiscardNoteButton({
  onPress,
  disabled,
}: DiscardNoteButtonProps) {
  const { colorScheme } = useColorScheme();

  const chipColor = hsl("destructive-foreground", colorScheme);
  return (
    <Button
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Discard note"
      className="flex-row items-center gap-1.5"
      variant="ghost"
      size="sm"
    >
      <Icon name="trash-2" size={12} hslColor={chipColor} />
      <Typography variant="h4" style={{ color: chipColor, ...styles.label }}>
        Discard
      </Typography>
    </Button>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  label: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "600",
  },
});
