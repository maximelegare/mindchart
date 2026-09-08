import categoryKeywordsByLang from "./categoryKeywords.json" with { type: "json" };
import { DEFAULT_LANGUAGE, resolveLanguageCode } from "../constants/lang";

export const CLASSIFIABLE_CATEGORY_IDS = [
  "problem",
  "insight",
  "question",
  "memory",
  "idea",
] as const;

export type ClassifiableCategoryId = (typeof CLASSIFIABLE_CATEGORY_IDS)[number];

export type CategoryKeywords = Record<ClassifiableCategoryId, string[]>;

export const getCategoryKeywords = (
  language?: string | null
): CategoryKeywords => {
  const locale = resolveLanguageCode(language);
  return (categoryKeywordsByLang[locale] ??
    categoryKeywordsByLang[DEFAULT_LANGUAGE]) as CategoryKeywords;
};
