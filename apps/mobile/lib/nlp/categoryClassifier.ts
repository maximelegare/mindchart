import { categoryRulesFor } from "./categoryRules";
import type { NlpLanguage, ThoughtCategoryId } from "./types";

const CATEGORY_MIN_SCORE = 2.2;

export const classifyCategory = (
  text: string,
  language: NlpLanguage
): { category: ThoughtCategoryId | null; confidence: number } => {
  const normalized = text.trim();
  if (!normalized) return { category: null, confidence: 0 };

  const lower = normalized.toLowerCase();
  let best: { category: ThoughtCategoryId; score: number } | null = null;

  for (const rule of categoryRulesFor(language)) {
    let score = 0;
    for (const pattern of rule.patterns) {
      if (pattern.test(normalized)) score += rule.weight;
    }
    for (const keyword of rule.keywords) {
      if (lower.includes(keyword.toLowerCase())) score += rule.weight * 0.7;
    }
    if (!best || score > best.score) {
      best = { category: rule.category, score };
    }
  }

  if (!best || best.score < CATEGORY_MIN_SCORE) {
    return { category: null, confidence: 0 };
  }

  return {
    category: best.category,
    confidence: Math.min(1, best.score / 8),
  };
};
