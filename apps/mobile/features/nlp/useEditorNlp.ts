import React from "react";
import type { UseFormGetValues, UseFormSetValue } from "react-hook-form";
import {
  createNlpJob,
  needsNlp,
  processNlpJob,
  resolveStructureLock,
  thoughtNlpSourceHash,
  type EmbedStructureText,
  type NlpJobResult,
} from "@/lib/nlp";
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
  embed?: EmbedStructureText;
};

export const useEditorNlp = ({
  getValues,
  setValue,
  noteId,
  injectIfReady,
  applyParagraphSplitScript,
  setThoughtCategoryScript,
  setThoughtSemanticTitleScript,
  categoryLabels,
  embed,
}: UseEditorNlpOptions) => {
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
    embed,
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
    embed,
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
      if (
        result.pieces.length > 1 &&
        source.type === "text" &&
        !source.nlpStructureLocked
      ) {
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

  const flushPendingNlp = React.useCallback(async () => {
    if (applyingRef.current) return;
    const processed = new Set<string>();
    for (;;) {
      const ctx = latestRef.current;
      const current = ctx.getValues("thoughts") ?? [];
      const thought = current.find(
        (item) => !processed.has(item.id) && needsNlp(item)
      );
      if (!thought) break;
      processed.add(thought.id);
      const resolved = thought.nlpStructureLocked
        ? await resolveStructureLock(thought, ctx.embed)
        : thought;
      if (resolved !== thought) {
        ctx.setValue(
          "thoughts",
          current.map((item) => (item.id === thought.id ? resolved : item)),
          { shouldDirty: true }
        );
      }
      applyResult(processNlpJob(createNlpJob(resolved)));
    }
  }, [applyResult]);

  return {
    flushPendingNlp,
  };
};
