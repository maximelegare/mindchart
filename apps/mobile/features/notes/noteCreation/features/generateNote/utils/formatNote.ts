import {
  LocalAIResNoteSchema,
  LocalAIResNoteSchemaModel,
  LocalAIResThought,
  Note,
  Thought,
} from "@repo/zod-schemas";
import { generateID } from "@/utils/genrateID";

type NoteWithTopic = Omit<Note, "topicId"> & {
  topic: string;
};

export const formatNote = (
  data: LocalAIResNoteSchemaModel,
  rawText: string
): { note: NoteWithTopic; thoughts: Thought[] } => {
  const { summary, thoughts, title, topic } = LocalAIResNoteSchema.parse(data);

  const noteId = generateID();

  const formatedNote = {
    topic,
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
