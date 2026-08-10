import { vars } from "nativewind";
import { THEME_CONFIG } from "@repo/theme/global";

/** NativeWind expects `H S% L%` (no commas) inside `hsl(var(--token))`. */
function toNativeWindHslChannels(value: string) {
  return value.replace(/,\s*/g, " ");
}

/** Apply theme CSS variables from the active color scheme (NativeWind root vars). */
export function themeVars(scheme: "light" | "dark") {
  return vars(
    Object.fromEntries(
      Object.entries(THEME_CONFIG[scheme]).map(([key, value]) => [
        `--${key}`,
        toNativeWindHslChannels(value),
      ])
    )
  );
}
