import type { ViewStyle } from "react-native";
import type { ColorScheme } from "@repo/theme/global";
import { hsl } from "@/utils/hsl";

/** Outer settings panel (expandable / manage cards). */
export function settingsPanelStyle(colorScheme: ColorScheme): ViewStyle {
  return {
    backgroundColor: hsl("card", colorScheme),
    borderColor: hsl("border", colorScheme),
    borderWidth: 1,
    borderRadius: 16,
  };
}

/** Inset row inside a settings panel (models, workspaces). */
export function settingsInsetStyle(
  colorScheme: ColorScheme,
  active = false
): ViewStyle {
  return {
    backgroundColor: hsl(
      colorScheme === "dark" ? "background" : "muted",
      colorScheme
    ),
    borderColor: hsl("border", colorScheme),
    borderWidth: active ? 1 : 0,
    borderRadius: 12,
    opacity: active ? 1 : 0.55,
  };
}

/** Engine / workspace status strip — no border. */
export function settingsStatusStyle(colorScheme: ColorScheme): ViewStyle {
  return {
    backgroundColor:
      colorScheme === "dark"
        ? hsl("secondary", colorScheme)
        : hsl("muted", colorScheme),
    borderWidth: 0,
    borderRadius: 12,
  };
}
