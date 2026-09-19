import type { NlpLanguage } from "../types";
import { STOP_WORDS_EN } from "./en";
import { STOP_WORDS_FR } from "./fr";

export const stopWordsFor = (language: NlpLanguage): Set<string> =>
  language === "fr" ? STOP_WORDS_FR : STOP_WORDS_EN;

export const isStopWord = (word: string, language: NlpLanguage): boolean =>
  stopWordsFor(language).has(word.toLowerCase().replace(/['’].*$/, ""));
