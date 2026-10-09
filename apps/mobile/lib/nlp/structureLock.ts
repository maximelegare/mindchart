import type { NlpMetadataSource, Thought } from "@repo/zod-schemas";
import { thoughtNlpSourceHash } from "./contentHash";

export const lockThoughtStructure = (
  thought: Thought,
  options: { categorySource?: NlpMetadataSource } = {}
): Thought => ({
  ...thought,
  nlpStructureLocked: true,
  nlpStructureSourceHash: thoughtNlpSourceHash(thought),
  nlpStructureAnchor: undefined,
  categorySource: options.categorySource ?? thought.categorySource,
});

export const clearThoughtStructureLock = (thought: Thought): Thought => ({
  ...thought,
  nlpStructureLocked: false,
  nlpStructureSourceHash: undefined,
  nlpStructureAnchor: undefined,
});
