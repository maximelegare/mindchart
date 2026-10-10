import {
  AbsoluteSummarizerConfig,
  DefaultTextParser,
  NullLogger,
  SorensenDiceSimilarity,
  Summarizer,
} from "ts-textrank";
import { analyzeThought } from "./analyzeThought";
import { detectLanguage } from "./language";

const DAMPING = 0.85;
const MIN_SENTENCE_CHARS = 2;
const HEADLINE_WORDS = 6;

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

export type SplitParagraphPiece = {
  text: string;
  title: string;
  semanticLabel: string;
  categoryId: string;
};

const fallbackSplit = (text: string): string[] => {
  const parts = text
    .split(/(?<=[.!?])(?:\s+|(?=[A-ZÀ-ÖØ-Þ]))|\n+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= MIN_SENTENCE_CHARS);
  return parts.length > 0 ? parts : [text];
};

const restorePunctuation = (raw: string, original: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  const index = original.indexOf(trimmed);
  if (index < 0) return trimmed;
  const after = original.charAt(index + trimmed.length);
  if (after === "." || after === "!" || after === "?") {
    return trimmed + after;
  }
  return trimmed;
};

const headlineForThought = (text: string, semantic: string | null): string => {
  const label = semantic?.replace(/\s+/g, " ").trim() ?? "";
  if (label) return label;
  const words = text.split(/\s+/).filter(Boolean);
  return words.slice(0, HEADLINE_WORDS).join(" ");
};

/** Split a finished paragraph into sentence-level thoughts via TextRank. */
export const splitParagraphIntoThoughts = (htmlOrText: string): string[] => {
  const cleaned = stripHtml(htmlOrText);
  if (!cleaned) return [];

  const language = detectLanguage(cleaned);
  const lang = language === "fr" ? "fr" : "en";

  try {
    const parser = new DefaultTextParser();
    const parsed = parser.parse(cleaned, lang);
    const sentences = parsed.sentences
      .slice()
      .sort((left, right) => left.position - right.position)
      .map((sentence) => restorePunctuation(sentence.raw, cleaned))
      .filter((sentence) => sentence.length >= MIN_SENTENCE_CHARS);

    const fallback = fallbackSplit(cleaned);
    if (sentences.length <= 1) {
      return fallback.length > 0 ? fallback : [cleaned];
    }

    const config = new AbsoluteSummarizerConfig(
      sentences.length,
      new SorensenDiceSimilarity(),
      parser,
      DAMPING,
      Summarizer.SORT_OCCURENCE
    );
    const summarizer = new Summarizer(config, new NullLogger());
    const ranked = summarizer
      .summarize(cleaned, lang)
      .map((sentence) => restorePunctuation(sentence, cleaned))
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length >= MIN_SENTENCE_CHARS);

    const result = ranked.length > 0 ? ranked : sentences;
    if (result.length <= 1 && fallback.length > 1) return fallback;
    return result.length > 0 ? result : fallback;
  } catch {
    return fallbackSplit(cleaned);
  }
};

export const analyzeSplitParagraphPieces = (
  texts: string[],
  options: { fallbackCategoryId?: string } = {}
): SplitParagraphPiece[] => {
  const fallbackCategoryId = options.fallbackCategoryId || "uncategorized";
  return texts.map((text, index) => {
    const nlp = analyzeThought(text);
    const title = headlineForThought(text, nlp.semanticLabel);
    const categoryId = nlp.category
      ? nlp.category
      : index === 0
        ? fallbackCategoryId
        : "uncategorized";
    return {
      text,
      title,
      semanticLabel: nlp.semanticLabel ?? title,
      categoryId,
    };
  });
};
