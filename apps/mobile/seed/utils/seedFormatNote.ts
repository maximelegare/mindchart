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
  console.log("data", data);
  const { summary, thoughts, title, topicId } =
    SeedLocalAIResNoteSchema.parse(data);

  const noteId = generateID();

  const formatedNote = {
    topicId,
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
