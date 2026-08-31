import {
  SeedLocalAIResNoteSchema,
  SeedLocalAIResNoteSchemaModel,
  LocalAIResThought,
  Note,
  Thought,
} from "@repo/zod-schemas";
import { generateID } from "@/utils/genrateID";

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
  };

  const formatedToughts = thoughts.map((t: LocalAIResThought) => {
    const recordId = generateID();
    const categoryId = t.category ?? "uncategorized";
    const thoughtId = t.thoughtId ?? recordId;

    return {
      ...t,
      noteId,
      id: recordId,
      thoughtId,
      categoryId: categoryId.toLowerCase(),
      createdAt: new Date().toISOString(),
    };
  });

  return { note: formatedNote, thoughts: formatedToughts };
};
