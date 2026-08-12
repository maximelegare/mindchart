import {
  LocalAIResNoteSchema,
  LocalAIResNoteSchemaModel,
  LocalAIResThought,
  Note,
  Thought,
} from "@repo/zod-schemas";
import { generateID } from "@/utils/genrateID";

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
  };

  const formatedToughts = thoughts.map((t: LocalAIResThought) => {
    const recordId = generateID();
    const categoryId = t.category ?? "uncategorized";
    const thoughtId = t.thoughtId ?? recordId;
    const thoughtTitle = (t.title ?? "").trim();
    const thoughtSummary = (t.summary ?? "").trim();

    return {
      id: recordId,
      thoughtId,
      noteId,
      title: thoughtTitle,
      summary: thoughtSummary,
      semanticLabel:
        (t.semanticLabel ?? "").trim() || thoughtTitle || thoughtSummary,
      categoryId: categoryId.toLowerCase(),
      createdAt: new Date().toISOString(),
    };
  });

  return { note: formatedNote, thoughts: formatedToughts };
};
