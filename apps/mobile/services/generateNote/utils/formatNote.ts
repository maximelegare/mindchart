import {
  LocalAIResNoteSchema,
  LocalAIResThought,
  Note,
  Thought,
} from "@repo/zod-schemas";
import { generateID } from "@/utils/genrateID";

export const formatNote = (
  data: unknown
): { note: Note; thoughts: Thought[] } => {
  const { summary, thoughts, title } = LocalAIResNoteSchema.parse(data);

  const noteId = generateID();

  const formatedNote = {
    id: noteId,
    title,
    summary,
    createdAt: new Date().toISOString(),
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

  const ret = { note: formatedNote, thoughts: formatedToughts };

  return ret;
};
