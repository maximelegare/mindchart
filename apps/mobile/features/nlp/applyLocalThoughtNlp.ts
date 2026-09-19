import { Thought } from "@repo/zod-schemas";
import { getOPDatabase, updateThoughtNlpQuery } from "@repo/sqlite";
import { analyzeThought, isDisplayableSemanticLabel } from "@/lib/nlp";

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const thoughtText = (thought: Thought) =>
  stripHtml(thought.summary) || stripHtml(thought.title);

const isFallbackLabel = (thought: Thought) => {
  const label = stripHtml(thought.semanticLabel).toLowerCase();
  if (!label) return true;
  const title = stripHtml(thought.title).toLowerCase();
  const summary = stripHtml(thought.summary).toLowerCase();
  return label === title || label === summary;
};

export const applyLocalThoughtNlp = async (thoughts: Thought[]) => {
  const patches: Array<{
    id: string;
    semanticLabel?: string;
    categoryId?: string;
  }> = [];

  for (const thought of thoughts) {
    const text = thoughtText(thought);
    if (!text) continue;

    try {
      const result = analyzeThought(text);
      const patch: {
        id: string;
        semanticLabel?: string;
        categoryId?: string;
      } = { id: thought.id };

      const currentLabel = stripHtml(thought.semanticLabel);
      if (result.semanticLabel) {
        patch.semanticLabel = result.semanticLabel;
      } else if (
        currentLabel &&
        (isFallbackLabel(thought) ||
          !isDisplayableSemanticLabel(currentLabel, text))
      ) {
        patch.semanticLabel = "";
      }

      const currentCategory = thought.categoryId || "uncategorized";
      if (
        result.category &&
        result.categoryConfidence >= 0.35 &&
        currentCategory === "uncategorized"
      ) {
        patch.categoryId = result.category;
      }

      if (patch.semanticLabel != null || patch.categoryId != null) {
        patches.push(patch);
      }
    } catch (error) {
      console.warn("Local thought NLP failed:", error);
    }
  }

  if (patches.length === 0) return;
  const db = getOPDatabase();
  await updateThoughtNlpQuery(db, patches);
};
