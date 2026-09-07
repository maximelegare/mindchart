import { View } from "react-native";
import { Icon } from "@/components/ui/icons/icon";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";

export const CHECKBOX_MARK_SIZE = 16;

/** Decorative checklist mark — not pressable. */
export function StaticCheckboxMark({ completed }: { completed: boolean }) {
  const { colorScheme } = useColorScheme();
  const stroke = hsl("muted-foreground", colorScheme);
  const fill = hsl("card", colorScheme);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{
        width: CHECKBOX_MARK_SIZE,
        height: CHECKBOX_MARK_SIZE,
        borderWidth: 2,
        borderRadius: 3,
        borderColor: stroke,
        backgroundColor: completed ? stroke : fill,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {completed ? <Icon name="check" size={11} color="card" /> : null}
    </View>
  );
}
