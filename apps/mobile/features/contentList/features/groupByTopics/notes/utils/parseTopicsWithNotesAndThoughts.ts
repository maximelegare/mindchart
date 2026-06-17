import z from "zod";
import {
  TopicsJoinNotesThoughtsParsedSchema,
  TopicsJoinNotesThoughtsParsedSchemaModel,
} from "@repo/zod-schemas/client";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";

const parseNotesJson = (notesJson: unknown) => {
  if (typeof notesJson === "string") return JSON.parse(notesJson);
  if (Array.isArray(notesJson)) return notesJson;
  return [];
};

export const parseTopicsWithNotesAndThoughts = (
  data: unknown
): TopicsJoinNotesThoughtsParsedSchemaModel[] | null => {
  if (!data || !Array.isArray(data)) return null;

  const transformed = data
    .map((row) => ({
      id: row.topic_id,
      name: row.topic_name,
      createdAt: row.topic_created_at,
      notes: parseNoteAndThoughts(parseNotesJson(row.notes_json)) ?? [],
    }))
    .filter((topic) => topic.notes.length > 0);

  const result = z
    .array(TopicsJoinNotesThoughtsParsedSchema)
    .safeParse(transformed);
  if (!result.success) {
    console.error("parseTopicsWithNotesAndThoughts:", result.error);
    return null;
  }

  return result.data;
};
