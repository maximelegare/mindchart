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

  const formatedToughts = thoughts.map((t: LocalAIResThought) => {
    const recordId = generateID();
    const thoughtId = t.thoughtId ?? recordId;
    const thoughtTitle = (t.title ?? "").trim();
    const thoughtSummary = (t.summary ?? "").trim();
    const semanticLabel =
      (t.semanticLabel ?? "").trim() || thoughtTitle || thoughtSummary;

    return {
      noteId,
      id: recordId,
      thoughtId,
      title: thoughtTitle,
      summary: thoughtSummary,
      semanticLabel,
      categoryId: resolveSeedCategory(
        t,
        `${thoughtTitle} ${thoughtSummary} ${semanticLabel}`
      ),
      createdAt: new Date().toISOString(),
      isCompletable: false,
      isCompleted: false,
    };
  });

  return { note: formatedNote, thoughts: formatedToughts };
};
