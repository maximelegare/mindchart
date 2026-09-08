import { type CategoryKey } from "@repo/sqlite";
import {
  CLASSIFIABLE_CATEGORY_IDS,
  getCategoryKeywords,
  type CategoryKeywords,
  type ClassifiableCategoryId,
} from "@/features/translations/data/getCategoryKeywords";
import { getStoredLocalePreference } from "@/features/translations/lib/localePreference";
import { DEFAULT_LANGUAGE } from "@/features/translations/constants/lang";

const normalize = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const textContainsKeyword = (haystack: string, keyword: string): boolean => {
  const needle = normalize(keyword).trim();
  if (!needle) return false;

  if (/[^a-z0-9]/.test(needle)) {
    return haystack.includes(needle);
  }

  const pattern = new RegExp(
    `(^|[^a-z0-9])${escapeRegex(needle)}([^a-z0-9]|$)`
  );
  return pattern.test(haystack);
};

const scoreCategory = (haystack: string, keywords: string[]): number => {
  let score = 0;
  for (const keyword of keywords) {
    const needle = normalize(keyword).trim();
    if (!needle) continue;
    if (textContainsKeyword(haystack, keyword)) {
      score += needle.length;
    }
  }
  return score;
};

const classifyWithKeywords = (
  haystack: string,
  keywords: CategoryKeywords
): CategoryKey => {
  const hasQuestionMark = haystack.includes("?");

  let bestCategory: ClassifiableCategoryId | null = null;
  let bestScore = 0;

  for (const categoryId of CLASSIFIABLE_CATEGORY_IDS) {
    let score = scoreCategory(haystack, keywords[categoryId] ?? []);
    if (categoryId === "question" && hasQuestionMark) {
      score += 8;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = categoryId;
    }
  }

  if (!bestCategory || bestScore <= 0) {
    return "uncategorized";
  }

  return bestCategory;
};

export const classifyCategory = (
  text: string,
  language?: string | null
): CategoryKey => {
  const locale = language ?? getStoredLocalePreference() ?? DEFAULT_LANGUAGE;
  const haystack = normalize(text);
  const classified = classifyWithKeywords(
    haystack,
    getCategoryKeywords(locale)
  );

  if (classified !== "uncategorized" || locale === DEFAULT_LANGUAGE) {
    return classified;
  }

  return classifyWithKeywords(haystack, getCategoryKeywords(DEFAULT_LANGUAGE));
};
