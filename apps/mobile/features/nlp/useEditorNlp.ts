import React from "react";
import type { UseFormGetValues, UseFormSetValue } from "react-hook-form";
import {
  NLP_DEBOUNCE_MS,
  createNlpJob,
  needsNlp,
  processNlpJob,
  thoughtNlpSourceHash,
  type NlpJobResult,
} from "@/lib/nlp";
import { enqueueNlpJob } from "./nlpQueue";
import {
  applyEditorNlpResult,
  nlpPiecesForEditor,
} from "./applyEditorNlpResult";
import type {
  ThoughtsEditorFormValues,
  ThoughtsFormValue,
} from "@/components/ui/thoughtsEditor/types";
import { createEmptyThought } from "@/components/ui/thoughtsEditor/types";

type Inject = (script: string) => void;

type UseEditorNlpOptions = {
  getValues: UseFormGetValues<ThoughtsEditorFormValues>;
  setValue: UseFormSetValue<ThoughtsEditorFormValues>;
  noteId: string;
  readOnly: boolean;
  thoughts: ThoughtsFormValue[] | undefined;
  injectIfReady: Inject;
  applyParagraphSplitScript: (
    sourceId: string,
    pieces: ReturnType<typeof nlpPiecesForEditor>
  ) => string;
  setThoughtCategoryScript: (
    index: number,
    categoryId: string,
    label?: string
  ) => string;
  setThoughtSemanticTitleScript: (index: number, title: string) => string;
  categoryLabels: Map<string, string>;
};

export const useEditorNlp = ({
  getValues,
  setValue,
  noteId,
  readOnly,
  thoughts,
  injectIfReady,
  applyParagraphSplitScript,
  setThoughtCategoryScript,
  setThoughtSemanticTitleScript,
  categoryLabels,
}: UseEditorNlpOptions) => {
  const timersRef = React.useRef(
    new Map<string, ReturnType<typeof setTimeout>>()
  );
  const applyingRef = React.useRef(false);
  const latestRef = React.useRef({
    getValues,
    setValue,
    noteId,
    injectIfReady,
    applyParagraphSplitScript,
    setThoughtCategoryScript,
    setThoughtSemanticTitleScript,
    categoryLabels,
  });
  latestRef.current = {
    getValues,
    setValue,
    noteId,
    injectIfReady,
    applyParagraphSplitScript,
    setThoughtCategoryScript,
    setThoughtSemanticTitleScript,
    categoryLabels,
  };

  const applyResult = React.useCallback(
    (result: NlpJobResult, insertEmptyAfter?: { id: string }) => {
      const ctx = latestRef.current;
      const previous = ctx.getValues("thoughts") ?? [];
      const source = previous.find(
        (thought) =>
          thought.id === result.thoughtId ||
          thought.thoughtId === result.thoughtId
      );
      if (!source) return;
      if (thoughtNlpSourceHash(source) !== result.sourceHash) return;

      applyingRef.current = true;
      let next = applyEditorNlpResult(previous, result, ctx.noteId);
      if (!next) {
        applyingRef.current = false;
        return;
      }
      if (insertEmptyAfter) {
        const empty = {
          ...createEmptyThought(ctx.noteId, "text"),
          id: insertEmptyAfter.id,
          thoughtId: insertEmptyAfter.id,
        };
        const insertAt =
          next.findIndex((thought) => thought.id === result.thoughtId) +
          result.pieces.length;
        next = [...next.slice(0, insertAt), empty, ...next.slice(insertAt)];
      }
      ctx.setValue("thoughts", next, { shouldDirty: true });

      const start = next.findIndex(
        (thought) =>
          thought.id === result.thoughtId ||
          thought.thoughtId === result.thoughtId
      );
      const applied = next.slice(start, start + result.pieces.length);
      if (result.pieces.length > 1 && source.type === "text") {
        ctx.injectIfReady(
          ctx.applyParagraphSplitScript(
            result.thoughtId,
            nlpPiecesForEditor(applied)
          )
        );
      } else {
        const piece = applied[0];
        if (piece && start >= 0) {
          if (piece.categoryId) {
            ctx.injectIfReady(
              ctx.setThoughtCategoryScript(
                start,
                piece.categoryId,
                ctx.categoryLabels.get(piece.categoryId)
              )
            );
          }
          if (piece.semanticLabel) {
            ctx.injectIfReady(
              ctx.setThoughtSemanticTitleScript(start, piece.semanticLabel)
            );
          }
        }
      }
      queueMicrotask(() => {
        applyingRef.current = false;
      });
    },
    []
  );

  const cancelTimer = React.useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) clearTimeout(timer);
    timersRef.current.delete(id);
  }, []);

  const scheduleThought = React.useCallback(
    (thought: ThoughtsFormValue) => {
      if (readOnly || applyingRef.current) return;
      if (!needsNlp(thought)) {
        cancelTimer(thought.id);
        return;
      }
      cancelTimer(thought.id);
      const timer = setTimeout(() => {
        timersRef.current.delete(thought.id);
        const current = latestRef.current
          .getValues("thoughts")
          ?.find((item) => item.id === thought.id);
        if (!current || !needsNlp(current)) return;
        enqueueNlpJob(createNlpJob(current), (result) => applyResult(result));
      }, NLP_DEBOUNCE_MS);
      timersRef.current.set(thought.id, timer);
    },
    [applyResult, cancelTimer, readOnly]
  );

  const processThoughtNow = React.useCallback(
    (thought: ThoughtsFormValue, insertEmptyAfter?: { id: string }) => {
      cancelTimer(thought.id);
      if (needsNlp(thought)) {
        applyResult(processNlpJob(createNlpJob(thought)), insertEmptyAfter);
        return;
      }
      if (!insertEmptyAfter) return;
      const ctx = latestRef.current;
      const previous = ctx.getValues("thoughts") ?? [];
      if (previous.some((item) => item.id === insertEmptyAfter.id)) return;
      const index = previous.findIndex((item) => item.id === thought.id);
      if (index < 0) return;
      const empty = {
        ...createEmptyThought(ctx.noteId, "text"),
        id: insertEmptyAfter.id,
        thoughtId: insertEmptyAfter.id,
      };
      ctx.setValue(
        "thoughts",
        [...previous.slice(0, index + 1), empty, ...previous.slice(index + 1)],
        { shouldDirty: true }
      );
    },
    [applyResult, cancelTimer]
  );

  const flushPendingNlp = React.useCallback(() => {
    for (const timer of timersRef.current.values()) clearTimeout(timer);
    timersRef.current.clear();
    const current = latestRef.current.getValues("thoughts") ?? [];
    for (const thought of current) {
      if (!needsNlp(thought)) continue;
      applyResult(processNlpJob(createNlpJob(thought)));
    }
  }, [applyResult]);

  React.useEffect(() => {
    if (readOnly || applyingRef.current) return;
    for (const thought of thoughts ?? []) {
      scheduleThought(thought);
    }
  }, [readOnly, scheduleThought, thoughts]);

  React.useEffect(
    () => () => {
      for (const timer of timersRef.current.values()) clearTimeout(timer);
      timersRef.current.clear();
    },
    []
  );

  return {
    flushPendingNlp,
    processThoughtNow,
  };
};
