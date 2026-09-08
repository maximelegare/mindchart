const LANGUAGE_ENTRIES = [
  ["fr-CA", "Français"],
  ["en-US", "English"],
] as const;

export type LanguageCode = (typeof LANGUAGE_ENTRIES)[number][0];

export const LANGUAGES = new Map<string, string>(LANGUAGE_ENTRIES);

export const DEFAULT_LANGUAGE: LanguageCode = "en-US";

export const resolveLanguageCode = (locale?: string | null): LanguageCode => {
  if (locale && LANGUAGES.has(locale)) {
    return locale as LanguageCode;
  }
  return DEFAULT_LANGUAGE;
};
