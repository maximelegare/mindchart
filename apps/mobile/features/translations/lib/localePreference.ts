import { getItem, setItem } from "@/lib/storage";
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  type LanguageCode,
} from "../constants/lang";

const LOCALE_STORAGE_KEY = "locale";

export function getStoredLocalePreference(): LanguageCode | null {
  const stored = getItem<string>(LOCALE_STORAGE_KEY);
  if (stored && LANGUAGES.has(stored)) {
    return stored as LanguageCode;
  }
  return null;
}

export function setStoredLocalePreference(locale: LanguageCode) {
  setItem(LOCALE_STORAGE_KEY, locale);
}

export function getDeviceLocales(): string[] {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return locale ? [locale] : [];
  } catch {
    return [];
  }
}

export function getInitialClientLocales(): string[] {
  const stored = getStoredLocalePreference();
  const deviceLocales = getDeviceLocales();

  return [
    ...(stored ? [stored] : []),
    ...deviceLocales,
    DEFAULT_LANGUAGE,
  ].filter(Boolean);
}

export function getLanguageLabel(code: LanguageCode): string {
  return LANGUAGES.get(code) ?? code;
}
