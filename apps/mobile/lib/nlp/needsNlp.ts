import type { Thought } from "@repo/zod-schemas";
import { thoughtHasNlpText, thoughtNlpSourceHash } from "./contentHash";

export const needsNlp = (thought: Thought): boolean => {
  if (!thoughtHasNlpText(thought)) return false;
  if (!thought.nlpSourceHash) return true;
  return thought.nlpSourceHash !== thoughtNlpSourceHash(thought);
};
