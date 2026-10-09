import { getThoughtPlainText, type Thought } from "@repo/zod-schemas";
import { thoughtNlpSourceHash } from "./contentHash";
import {
  STRUCTURE_LOCK_SIMILARITY,
  cosineSimilarity,
} from "./embeddingSimilarity";
import { clearThoughtStructureLock } from "./structureLock";

export type EmbedStructureText = (text: string) => Promise<Float32Array | null>;

export const resolveStructureLock = async (
  thought: Thought,
  embed?: EmbedStructureText
): Promise<Thought> => {
  if (!thought.nlpStructureLocked) return thought;
  const currentHash = thoughtNlpSourceHash(thought);
  if (thought.nlpStructureSourceHash === currentHash) return thought;

  const anchor = thought.nlpStructureAnchor;
  if (embed && anchor && anchor.length > 0) {
    try {
      const vector = await embed(getThoughtPlainText(thought));
      if (
        vector &&
        cosineSimilarity(anchor, vector) >= STRUCTURE_LOCK_SIMILARITY
      ) {
        return thought;
      }
    } catch {
      return clearThoughtStructureLock(thought);
    }
  }

  return clearThoughtStructureLock(thought);
};
