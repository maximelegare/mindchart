import { createLocaleContext } from "fbtee";
import { DEFAULT_LANGUAGE, LANGUAGES } from "../constants/lang";
import { getInitialClientLocales } from "../lib/localePreference";

const loadLocale = async (locale: string) => {
  switch (locale) {
    case "fr-CA":
      return (await import("../runtime/fr-CA.json")).default["fr-CA"];
    default:
      return {};
  }
};

export const LocaleContext = createLocaleContext({
  availableLanguages: LANGUAGES,
  clientLocales: getInitialClientLocales(),
  fallbackLocale: DEFAULT_LANGUAGE,
  loadLocale,
});

export { useLocaleContext } from "fbtee";
