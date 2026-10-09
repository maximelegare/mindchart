import { Thought } from "@repo/zod-schemas";
import { getOPDatabase, updateThoughtNlpQuery } from "@repo/sqlite";
import { thoughtNlpSourceHash } from "@/lib/nlp/contentHash";
import { needsNlp } from "@/lib/nlp/needsNlp";
import { createNlpJob, processNlpJob } from "@/lib/nlp/processNlpJob";
import { resolveStructureLock } from "@/lib/nlp/resolveStructureLock";

export const applyLocalThoughtNlp = async (thoughts: Thought[]) => {
  const patches: Array<{
    id: string;
    semanticLabel?: string;
    categoryId?: string;
    title?: string;
    nlpSourceHash?: string;
    titleSource?: string;
    categorySource?: string;
    nlpStructureLocked?: boolean;
    nlpStructureSourceHash?: string | null;
    nlpStructureAnchor?: Float32Array | null;
  }> = [];

  for (const thought of thoughts) {
    if (!needsNlp(thought)) continue;

    try {
      const resolved = thought.nlpStructureLocked
        ? await resolveStructureLock(thought)
        : thought;
      const job = createNlpJob(resolved);
      if (thoughtNlpSourceHash(resolved) !== job.sourceHash) continue;
      const result = processNlpJob(job);
      if (thoughtNlpSourceHash(resolved) !== result.sourceHash) continue;

      const piece = result.pieces[0];
      if (!piece) continue;

      const patch: (typeof patches)[number] = {
        id: thought.id,
        nlpSourceHash: result.sourceHash,
      };
      if (resolved.titleSource !== "user") {
        patch.title = piece.title;
        patch.titleSource = "generated";
      }
      if (resolved.categorySource !== "user") {
        patch.categoryId = piece.categoryId;
        patch.categorySource = "generated";
      }
      patch.semanticLabel = piece.semanticLabel;
      if (resolved.nlpStructureLocked !== thought.nlpStructureLocked) {
        patch.nlpStructureLocked = Boolean(resolved.nlpStructureLocked);
        patch.nlpStructureSourceHash = resolved.nlpStructureSourceHash ?? null;
        patch.nlpStructureAnchor = resolved.nlpStructureAnchor ?? null;
      }
      patches.push(patch);
    } catch (error) {
      console.warn("Local thought NLP failed:", error);
    }
  }

  if (patches.length === 0) return;
  const db = getOPDatabase();
  await updateThoughtNlpQuery(db, patches);
};
