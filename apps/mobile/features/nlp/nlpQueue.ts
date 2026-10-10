import { InteractionManager } from "react-native";
import {
  createNlpJob,
  processNlpJob,
  type NlpJob,
  type NlpJobResult,
} from "@/lib/nlp/processNlpJob";
import type { Thought } from "@repo/zod-schemas";

type ApplyNlpResult = (result: NlpJobResult) => void;

type PendingJob = {
  job: NlpJob;
  apply: ApplyNlpResult;
};

const pending = new Map<string, PendingJob>();
let pumping = false;

const runJob = (item: PendingJob) =>
  new Promise<void>((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      try {
        item.apply(processNlpJob(item.job));
      } catch (error) {
        console.warn("NLP job failed:", error);
      } finally {
        resolve();
      }
    });
  });

const pump = async () => {
  if (pumping) return;
  pumping = true;
  try {
    while (pending.size > 0) {
      const entry = pending.entries().next().value;
      if (!entry) break;
      const [id, item] = entry;
      pending.delete(id);
      await runJob(item);
    }
  } finally {
    pumping = false;
    if (pending.size > 0) void pump();
  }
};

export const enqueueNlpJob = (job: NlpJob, apply: ApplyNlpResult) => {
  if (!job.content.trim()) return;
  const existing = pending.get(job.thoughtId);
  if (existing && existing.job.sourceHash === job.sourceHash) return;
  pending.set(job.thoughtId, { job, apply });
  void pump();
};

export const enqueueThoughtNlp = (thought: Thought, apply: ApplyNlpResult) => {
  enqueueNlpJob(createNlpJob(thought), apply);
};
