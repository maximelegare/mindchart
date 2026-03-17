import { ColorScheme, THEME_CONFIG } from "@repo/theme/global";
import { Theme } from "@repo/theme/global";
import { CATEGORIES_COLORS } from "@repo/theme/categories";
import { CategoryKey } from "@repo/sqlite";

// Function overloads for type-safe value based on nameSpace
// New signature with nameSpace as 2nd parameter for better IntelliSense
// When nameSpace is "categories", value must be CategoryKey
export function hsl(
  value: CategoryKey,
  nameSpace: "categories",
  colorScheme: ColorScheme,
  darknessPercent?: number
): string;
// When nameSpace is "theme", value must be Theme | 'text'
export function hsl(
  value: Theme | "text",
  nameSpace: "theme",
  colorScheme: ColorScheme,
  darknessPercent?: number
): string;
// When nameSpace is omitted (defaults to "theme"), value must be Theme | 'text'
export function hsl(
  value: Theme | "text",
  colorScheme: ColorScheme,
  darknessPercent?: number
): string;
// Backward compatibility: old signature with nameSpace as 4th parameter
export function hsl(
  value: Theme | "text" | CategoryKey,
  colorScheme: ColorScheme,
  darknessPercent?: number,
  nameSpace?: "theme" | "categories"
): string;
// Implementation signature - handles both old and new parameter orders
export function hsl(
  value: Theme | "text" | CategoryKey,
  nameSpaceOrColorScheme: "theme" | "categories" | ColorScheme,
  colorSchemeOrDarkness?: ColorScheme | number,
  darknessPercentOrNameSpace?: number | "theme" | "categories"
): string {
  // Determine parameter order:
  // New signature: hsl(value, nameSpace, colorScheme, darknessPercent?)
  // Old signature: hsl(value, colorScheme, darknessPercent?, nameSpace?)
  let nameSpace: "theme" | "categories";
  let colorScheme: ColorScheme;
  let darknessPercent: number | undefined;

  if (
    nameSpaceOrColorScheme === "categories" ||
    nameSpaceOrColorScheme === "theme"
  ) {
    // New signature: 2nd param is nameSpace
    nameSpace = nameSpaceOrColorScheme;
    colorScheme = colorSchemeOrDarkness as ColorScheme;
    darknessPercent =
      typeof darknessPercentOrNameSpace === "number"
        ? darknessPercentOrNameSpace
        : undefined;
  } else {
    // Old signature: 2nd param is colorScheme
    colorScheme = nameSpaceOrColorScheme as ColorScheme;
    if (typeof colorSchemeOrDarkness === "number") {
      // Old signature: 3rd param is darknessPercent
      darknessPercent = colorSchemeOrDarkness;
      nameSpace =
        (darknessPercentOrNameSpace as "theme" | "categories" | undefined) ||
        "theme";
    } else if (
      darknessPercentOrNameSpace === "categories" ||
      darknessPercentOrNameSpace === "theme"
    ) {
      // Old signature: 3rd param is undefined, 4th param is nameSpace
      nameSpace = darknessPercentOrNameSpace;
      darknessPercent = undefined;
    } else {
      // Default: theme namespace, no darknessPercent
      nameSpace = "theme";
      darknessPercent = undefined;
    }
  }
  // Map 'text' to 'foreground' since 'text' is used in NAV_THEME but not in THEME_CONFIG
  const themeKey = value === "text" ? "foreground" : value;
  let color: string | undefined;

  if (nameSpace === "theme") {
    const theme = THEME_CONFIG[colorScheme as keyof typeof THEME_CONFIG];
    if (!theme) {
      console.warn(`Invalid color scheme: ${colorScheme}`);
      return "hsl(0,0%,0%)";
    }
    color = theme[themeKey as keyof typeof theme] as string;
  } else if (nameSpace === "categories") {
    color = CATEGORIES_COLORS[value as CategoryKey];
  }

  if (!color) {
    console.warn(`No color found for key: ${value}`);
    return "hsl(0,0%,0%)";
  }

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
