import { View } from "react-native";
import { Icon } from "@/components/ui/icons/icon";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";

export const CHECKBOX_MARK_SIZE = 16;

/** Decorative checklist mark — not pressable. */
export function StaticCheckboxMark({
  completed,
  color,
  size = CHECKBOX_MARK_SIZE,
}: {
  completed: boolean;
  color?: string;
  size?: number;
}) {
  const { colorScheme } = useColorScheme();
  const stroke = color ?? hsl("muted-foreground", colorScheme);
  const fill = hsl("card", colorScheme);
  const checkSize = Math.max(8, Math.round(size * 0.7));

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{
        width: size,
        height: size,
        borderWidth: 2,
        borderRadius: 3,
        borderColor: stroke,
        backgroundColor: completed ? stroke : fill,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {completed ? <Icon name="check" size={checkSize} color="card" /> : null}
    </View>
  );
}
