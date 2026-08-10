import { Appearance } from "react-native";
import { colorScheme as nativewindColorScheme } from "nativewind";
import { getItem, setItem } from "@/lib/storage";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedColorScheme = "light" | "dark";

type Listener = () => void;

let preference: ThemePreference = readStoredPreference();
const listeners = new Set<Listener>();

function readStoredPreference(): ThemePreference {
  const stored = getItem<ThemePreference>("theme");
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function resolveThemePreference(
  pref: ThemePreference = preference
): ResolvedColorScheme {
  if (pref === "system") {
    return Appearance.getColorScheme() === "dark" ? "dark" : "light";
  }
  return pref;
}

export function getThemePreference() {
  return preference;
}

export function subscribeThemePreference(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Persist preference and notify the app. Also syncs NativeWind / Appearance. */
export function setThemePreference(next: ThemePreference) {
  preference = next;
  setItem("theme", next);

  try {
    nativewindColorScheme.set(next);
  } catch (error) {
    console.warn("NativeWind setColorScheme failed:", error);
  }

  // Force RN appearance so platform chrome tracks the choice.
  Appearance.setColorScheme(next === "system" ? null : next);
  emit();
}

// Keep subscribers in sync when the OS theme changes under "system".
Appearance.addChangeListener(() => {
  if (preference === "system") {
    emit();
  }
});
