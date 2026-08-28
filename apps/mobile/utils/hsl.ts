import { ColorScheme, THEME_CONFIG } from "@repo/theme/global";
import { Theme } from "@repo/theme/global";

/**
 * Resolve a theme token to its HSL color string.
 *
 * Supports two call shapes for backward compatibility:
 *   hsl(themeKey, colorScheme, darknessPercent?)
 *   hsl(themeKey, "theme", colorScheme, darknessPercent?)
 */
export function hsl(
  value: Theme | "text",
  colorScheme: ColorScheme,
  darknessPercent?: number
): string;
export function hsl(
  value: Theme | "text",
  _namespace: "theme",
  colorScheme: ColorScheme,
  darknessPercent?: number
): string;
export function hsl(
  value: Theme | "text",
  colorSchemeOrNamespace: ColorScheme | "theme",
  darknessOrColorScheme?: number | ColorScheme,
  darknessPercent?: number
): string {
  const colorScheme =
    colorSchemeOrNamespace === "theme"
      ? (darknessOrColorScheme as ColorScheme)
      : (colorSchemeOrNamespace as ColorScheme);

  const resolvedDarknessPercent =
    colorSchemeOrNamespace === "theme"
      ? darknessPercent
      : typeof darknessOrColorScheme === "number"
        ? darknessOrColorScheme
        : undefined;

  // Map 'text' to 'foreground' since 'text' is used in NAV_THEME but not in THEME_CONFIG
  const themeKey = value === "text" ? "foreground" : value;

  const theme = THEME_CONFIG[colorScheme as keyof typeof THEME_CONFIG];
  if (!theme) {
    console.warn(`Invalid color scheme: ${colorScheme}`);
    return "hsl(0,0%,0%)";
  }

  const color = theme[themeKey as keyof typeof theme] as string | undefined;
  if (!color) {
    console.warn(`No color found for theme key: ${value}`);
    return "hsl(0,0%,0%)";
  }

  return applyDarkness(color, resolvedDarknessPercent);
}

/**
 * Apply a darkness percent to an arbitrary HSL color string.
 */
export function hslColor(color: string, darknessPercent?: number): string {
  return applyDarkness(color, darknessPercent);
}

function applyDarkness(color: string, darknessPercent?: number): string {
  // Wrap in hsl() if not already wrapped
  const baseColor = color.startsWith("hsl(") ? color : `hsl(${color})`;

  if (darknessPercent == null) return baseColor;

  // Remove "hsl(" prefix and ")" suffix
  const inside = baseColor.replace(/^hsl\(|\)$/g, "").trim();

  // Split by comma or space
  const parts = inside.includes(",") ? inside.split(",") : inside.split(/\s+/);

  if (parts.length < 3) return color; // fallback

  const h = parts[0].trim();
  const s = parts[1].replace("%", "").trim();
  const l = parseFloat(parts[2].replace("%", "").trim());

  // Compute new lightness based on darknessPercent
  const newLightness = Math.max(0, l * (1 - darknessPercent / 100));

  return `hsl(${h}, ${s}%, ${newLightness}%)`;
}
