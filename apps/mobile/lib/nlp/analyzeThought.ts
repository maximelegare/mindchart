import { classifyCategory } from "./categoryClassifier";
import { detectLanguage } from "./language";
import { pickSemanticLabel } from "./semanticLabel";
import type { AnalyzeThoughtOptions, AnalyzeThoughtResult } from "./types";

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

export const analyzeThought = (
  text: string,
  options: AnalyzeThoughtOptions = {}
): AnalyzeThoughtResult => {
  const cleaned = stripHtml(text);
  const language =
    options.language && options.language !== "auto"
      ? options.language
      : detectLanguage(cleaned);

  if (cleaned.length < 3) {
    return {
      semanticLabel: null,
      category: null,
      confidence: 0,
      language,
      labelConfidence: 0,
      categoryConfidence: 0,
    };
  }

  const { label, confidence: labelConfidence } = pickSemanticLabel(
    cleaned,
    language
  );
  const { category, confidence: categoryConfidence } = classifyCategory(
    cleaned,
    language
  );

  return {
    semanticLabel: label,
    category,
    confidence: Math.max(labelConfidence, categoryConfidence),
    language,
    labelConfidence,
    categoryConfidence,
  };
};
