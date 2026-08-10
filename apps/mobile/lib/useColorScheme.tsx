import { useSyncExternalStore } from "react";
import {
  getThemePreference,
  resolveThemePreference,
  setThemePreference,
  subscribeThemePreference,
  type ThemePreference,
} from "@/lib/themePreference";

/**
 * App-owned color scheme. NativeWind's hook often won't re-render on Android
 * after setColorScheme (its observable only updates in tests), so we keep
 * preference + resolved scheme ourselves.
 */
export function useColorScheme() {
  const preference = useSyncExternalStore(
    subscribeThemePreference,
    getThemePreference,
    getThemePreference
  );
  const colorScheme = useSyncExternalStore(
    subscribeThemePreference,
    () => resolveThemePreference(getThemePreference()),
    () => resolveThemePreference(getThemePreference())
  );

  return {
    colorScheme,
    themePreference: preference,
    isDarkColorScheme: colorScheme === "dark",
    setColorScheme: (value: ThemePreference) => setThemePreference(value),
    toggleColorScheme: () =>
      setThemePreference(colorScheme === "dark" ? "light" : "dark"),
  };
}
