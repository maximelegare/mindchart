import {
  getThoughtPlainText,
  type NlpMetadataSource,
  type Thought,
  type ThoughtType,
} from "@repo/zod-schemas";
import { analyzeThought } from "./analyzeThought";
import { thoughtNlpSourceHash } from "./contentHash";
import { splitParagraphIntoThoughts } from "./splitParagraph";

export const NLP_DEBOUNCE_MS = 1000;

export type NlpJob = {
  thoughtId: string;
  type: ThoughtType;
  content: string;
  style?: "block" | "inline";
  sourceHash: string;
  fallbackCategoryId?: string;
  titleSource?: NlpMetadataSource;
  categorySource?: NlpMetadataSource;
  currentTitle?: string;
};

export type NlpResultPiece = {
  text: string;
  title: string;
  semanticLabel: string;
  categoryId: string;
  style: "block" | "inline";
};

export type NlpJobResult = {
  thoughtId: string;
  sourceHash: string;
  pieces: NlpResultPiece[];
};

const headlineForThought = (text: string, semantic: string | null): string => {
  const label = semantic?.replace(/\s+/g, " ").trim() ?? "";
  if (label) return label;
  const words = text.split(/\s+/).filter(Boolean);
  return words.slice(0, 6).join(" ");
};

export const createNlpJob = (thought: Thought): NlpJob => ({
  thoughtId: thought.id,
  type: thought.type,
  content: getThoughtPlainText(thought),
  style: thought.type === "text" ? thought.content.style : undefined,
  sourceHash: thoughtNlpSourceHash(thought),
  fallbackCategoryId: thought.categoryId,
  titleSource: thought.titleSource === "user" ? "user" : "generated",
  categorySource: thought.categorySource === "user" ? "user" : "generated",
  currentTitle: thought.title,
});

const processStructure = (job: NlpJob): string[] => {
  if (job.type === "text" && job.style !== "inline") {
    const pieces = splitParagraphIntoThoughts(job.content);
    return pieces.length > 0 ? pieces : [job.content];
  }
  return [job.content];
};

const processMetadata = (job: NlpJob, texts: string[]): NlpResultPiece[] =>
  texts.map((text, index) => {
    const nlp = analyzeThought(text);
    const generatedTitle = headlineForThought(text, nlp.semanticLabel);
    const keepUserTitle =
      index === 0 &&
      job.titleSource === "user" &&
      Boolean(job.currentTitle?.trim());
    const keepUserCategory =
      index === 0 &&
      job.categorySource === "user" &&
      Boolean(job.fallbackCategoryId);
    const generatedCategory =
      nlp.category && nlp.categoryConfidence >= 0.35 ? nlp.category : undefined;
    const categoryId = keepUserCategory
      ? (job.fallbackCategoryId ?? "uncategorized")
      : (generatedCategory ??
        (index === 0
          ? job.fallbackCategoryId || "uncategorized"
          : "uncategorized"));
    return {
      text,
      title: keepUserTitle ? (job.currentTitle ?? "") : generatedTitle,
      semanticLabel: nlp.semanticLabel ?? generatedTitle,
      categoryId,
      style:
        index === 0 ? (job.style === "inline" ? "inline" : "block") : "inline",
    };
  });

export const processNlpJob = (job: NlpJob): NlpJobResult => ({
  thoughtId: job.thoughtId,
  sourceHash: job.sourceHash,
  pieces: processMetadata(job, processStructure(job)),
});
