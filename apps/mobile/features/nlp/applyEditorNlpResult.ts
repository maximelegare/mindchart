import {
  getThoughtPlainText,
  isTextLikeThought,
  type Thought,
  type ThoughtType,
} from "@repo/zod-schemas";
import {
  createEmptyThought,
  setTextThoughtStyle,
  setThoughtContentText,
  type ThoughtsFormValue,
} from "@/components/ui/thoughtsEditor/types";
import { stripHtml } from "@/components/ui/thoughtsEditor/thoughtsHtml";
import { thoughtNlpSourceHash } from "@/lib/nlp/contentHash";
import type { NlpJobResult } from "@/lib/nlp/processNlpJob";

export const applyEditorNlpResult = (
  previous: ThoughtsFormValue[],
  result: NlpJobResult,
  noteId: string
): ThoughtsFormValue[] | null => {
  const index = previous.findIndex(
    (thought) =>
      thought.id === result.thoughtId || thought.thoughtId === result.thoughtId
  );
  if (index < 0) return null;
  const source = previous[index];
  if (!source) return null;
  if (thoughtNlpSourceHash(source) !== result.sourceHash) return null;

  const resultPieces =
    source.nlpStructureLocked && result.pieces.length > 1
      ? result.pieces.slice(0, 1)
      : result.pieces;

  const pieces = resultPieces.map((piece, pieceIndex) => {
    const type: ThoughtType =
      resultPieces.length > 1 && source.type === "text" ? "text" : source.type;
    const base = pieceIndex === 0 ? source : createEmptyThought(noteId, type);
    const text = (() => {
      const raw = piece.text ?? "";
      const body = raw.replace(/^[\s\u00a0]+/, "");
      if (!body) return raw;
      const needsSpace = pieceIndex > 0 || piece.style === "inline";
      return needsSpace ? ` ${body}` : body;
    })();
    const withText = setThoughtContentText(
      {
        ...base,
        title: piece.title,
        semanticLabel: piece.semanticLabel,
        categoryId: piece.categoryId,
        titleSource:
          pieceIndex === 0 && source.titleSource === "user"
            ? "user"
            : "generated",
        categorySource:
          pieceIndex === 0 && source.categorySource === "user"
            ? "user"
            : "generated",
      },
      text
    );
    const styled = isTextLikeThought(withText)
      ? setTextThoughtStyle(withText, piece.style)
      : withText;
    return {
      ...styled,
      nlpSourceHash: thoughtNlpSourceHash(styled),
    };
  });

  return [...previous.slice(0, index), ...pieces, ...previous.slice(index + 1)];
};

export const nlpPiecesForEditor = (thoughts: Thought[]) =>
  thoughts.map((thought) => ({
    id: thought.id,
    text: getThoughtPlainText(thought),
    title: stripHtml(thought.title) || thought.semanticLabel,
    categoryId: thought.categoryId || "uncategorized",
    inline: isTextLikeThought(thought) && thought.content.style === "inline",
  }));
