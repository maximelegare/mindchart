export const NLP_LANGUAGES = ["en", "fr"] as const;
export type NlpLanguage = (typeof NLP_LANGUAGES)[number];

/** Existing MindChart category ids. Insight/Memory are not in the schema. */
export const THOUGHT_CATEGORY_IDS = [
  "idea",
  "problem",
  "question",
  "action",
  "fact",
  "observation",
  "hypothesis",
  "item",
] as const;

export type ThoughtCategoryId = (typeof THOUGHT_CATEGORY_IDS)[number];

export type AnalyzeThoughtOptions = {
  language?: NlpLanguage | "auto";
};

export type AnalyzeThoughtResult = {
  semanticLabel: string | null;
  category: ThoughtCategoryId | null;
  confidence: number;
  language: NlpLanguage;
  labelConfidence: number;
  categoryConfidence: number;
};

export type LabelCandidate = {
  text: string;
  score: number;
  source: string;
};

export type CategoryRule = {
  category: ThoughtCategoryId;
  patterns: RegExp[];
  keywords: string[];
  weight: number;
};
