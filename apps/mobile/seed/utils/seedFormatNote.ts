import {
  SeedLocalAIResNoteSchema,
  SeedLocalAIResNoteSchemaModel,
  LocalAIResThought,
  Note,
  Thought,
} from "@repo/zod-schemas";
import { CATEGORIES_DEFINITIONS, type CategoryKey } from "@repo/sqlite";
import { generateID } from "@/utils/genrateID";
import { classifyCategory } from "@/features/categories/utils/classifyCategory";

const CATEGORY_IDS = new Set<string>(
  CATEGORIES_DEFINITIONS.map((category) => category.id)
);

const resolveSeedCategory = (
  thought: LocalAIResThought,
  text: string
): CategoryKey => {
  const fromSeed = thought.category?.trim().toLowerCase();
  if (fromSeed && CATEGORY_IDS.has(fromSeed)) {
    return fromSeed as CategoryKey;
  }
  return classifyCategory(text, "en-US");
};

const thoughtFromSeed = (t: LocalAIResThought, noteId: string): Thought => {
  const recordId = generateID();
  const thoughtId = t.thoughtId ?? recordId;
  const thoughtTitle = (t.title ?? "").trim();
  const thoughtText = (t.content?.text ?? t.summary ?? "").trim();
  const semanticLabel =
    (t.semanticLabel ?? "").trim() || thoughtTitle || thoughtText;
  const type = t.type ?? "li";
  const base = {
    noteId,
    id: recordId,
    thoughtId,
    contentId: generateID(),
    title: thoughtTitle,
    semanticLabel,
    categoryId: resolveSeedCategory(
      t,
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

export const seedFormatNote = (
  data: SeedLocalAIResNoteSchemaModel
): { note: Note; thoughts: Thought[] } => {
  const { summary, thoughts, title, folderId } =
    SeedLocalAIResNoteSchema.parse(data);

  const noteId = generateID();

  const formatedNote = {
    folderId,
    id: noteId,
    title,
    summary,
    rawText: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastViewedAt: null,
    showTitles: thoughts.some((thought) => Boolean(thought.title?.trim())),
  };

  const formatedToughts = thoughts.map((t) => thoughtFromSeed(t, noteId));

  return { note: formatedNote, thoughts: formatedToughts };
};
