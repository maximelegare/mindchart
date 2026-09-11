import {
  LocalAIResNoteSchema,
  LocalAIResNoteSchemaModel,
  LocalAIResThought,
  Note,
  Thought,
} from "@repo/zod-schemas";
import { generateID } from "@/utils/genrateID";
import { classifyCategory } from "@/features/categories/utils/classifyCategory";

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

  const formatedToughts = thoughts.map((t: LocalAIResThought) => {
    const recordId = generateID();
    const thoughtId = t.thoughtId ?? recordId;
    const thoughtTitle = (t.title ?? "").trim();
    const thoughtSummary = (t.summary ?? "").trim();
    const semanticLabel =
      (t.semanticLabel ?? "").trim() || thoughtTitle || thoughtSummary;

    return {
      id: recordId,
      thoughtId,
      noteId,
      title: thoughtTitle,
      summary: thoughtSummary,
      semanticLabel,
      categoryId: classifyCategory(
        `${thoughtTitle} ${thoughtSummary} ${semanticLabel}`
      ),
      createdAt: new Date().toISOString(),
      isCompletable: false,
      isCompleted: false,
    };
  });

  return { note: formatedNote, thoughts: formatedToughts };
};
