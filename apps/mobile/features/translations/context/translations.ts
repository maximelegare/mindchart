import { createLocaleContext } from "fbtee";
import { DEFAULT_LANGUAGE, LANGUAGES } from "../constants/lang";
import { getInitialClientLocales } from "../lib/localePreference";
import frCARuntime from "../runtime/fr-CA.json" with { type: "json" };

const FR_CA_TRANSLATIONS = frCARuntime["fr-CA"];

const loadLocale = async (locale: string) => {
  switch (locale) {
    case "fr-CA":
      return FR_CA_TRANSLATIONS;
    default:
      return {};
  }
};

export const LocaleContext = createLocaleContext({
  availableLanguages: LANGUAGES,
  clientLocales: getInitialClientLocales(),
  fallbackLocale: DEFAULT_LANGUAGE,
  loadLocale,
  translations: {
    [DEFAULT_LANGUAGE]: {},
    "fr-CA": FR_CA_TRANSLATIONS,
  },
});

export { useLocaleContext } from "fbtee";
