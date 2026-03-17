import z from "zod";
import {
  NotesJoinThoughtsParsedJSONPageSchema,
  NotesJoinThoughtsParsedJSONPageSchemaModel,
} from "@repo/zod-schemas/client";
export const parseNoteAndThoughts = (
  data: unknown
): Array<NotesJoinThoughtsParsedJSONPageSchemaModel> | null => {
  if (!data || !Array.isArray(data)) return null;

  const transformed = data.map((row) => ({
    id: row.note_id,
    title: row.note_title,
    summary: row.note_summary,
    created_at: row.note_created_at,
    // SQLite returns a stringified array from json_group_array
    thoughts:
      typeof row.thoughts_json === "string"
        ? JSON.parse(row.thoughts_json)
        : [],
  }));

  // Keep the Zod validation here to ensure your UI remains type-safe
  return z.array(NotesJoinThoughtsParsedJSONPageSchema).parse(transformed);
};
