import {
  LocalAIResNoteSchema,
  LocalAIResNoteSchemaModel,
  LocalAIResThought,
  Note,
  Thought,
} from "@repo/zod-schemas";
import { generateID } from "@/utils/genrateID";
import { classifyCategory } from "@/features/categories/utils/classifyCategory";

const thoughtFromLocalAi = (t: LocalAIResThought, noteId: string): Thought => {
  const recordId = generateID();
  const thoughtId = t.thoughtId ?? recordId;
  const thoughtTitle = (t.title ?? "").trim();
  const thoughtText = (t.content?.text ?? t.summary ?? "").trim();
  const semanticLabel =
    (t.semanticLabel ?? "").trim() || thoughtTitle || thoughtText;
  const type = t.type ?? "li";
  const base = {
    id: recordId,
    thoughtId,
    noteId,
    contentId: generateID(),
    title: thoughtTitle,
    semanticLabel,
    categoryId: classifyCategory(
      `${thoughtTitle} ${thoughtText} ${semanticLabel}`
    ),
    createdAt: new Date().toISOString(),
  };

  if (type === "checkbox") {
    return {
      ...base,
      type: "checkbox",
      content: { text: thoughtText, checked: t.content?.checked ?? false },
    };
  }

  if (type === "text") {
    return {
      ...base,
      type: "text",
      content: { text: thoughtText, style: "block" },
    };
  }

  return {
    ...base,
    type: "li",
    content: { text: thoughtText },
  };
};

export const formatNote = (
  data: LocalAIResNoteSchemaModel,
  rawText: string
): { note: Note; thoughts: Thought[] } => {
  const { summary, thoughts, title } = LocalAIResNoteSchema.parse(data);

  const noteId = generateID();

  const formatedNote: Note = {
    id: noteId,
    title,
    summary,
    rawText,
    createdAt: new Date().toISOString(),
    showTitles: thoughts.some((thought) => Boolean(thought.title?.trim())),
  };

  const formatedToughts = thoughts.map((t) => thoughtFromLocalAi(t, noteId));

  return { note: formatedNote, thoughts: formatedToughts };
};
