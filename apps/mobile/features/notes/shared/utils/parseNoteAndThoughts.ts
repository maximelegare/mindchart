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
    title: row.note_title ?? "",
    summary: row.note_summary ?? "",
    rawText: row.note_raw_text ?? "",
    created_at: row.note_created_at,
    thoughts: (typeof row.thoughts_json === "string"
      ? JSON.parse(row.thoughts_json)
      : Array.isArray(row.thoughts_json)
        ? row.thoughts_json
        : []
    ).map((thought: Record<string, unknown>) => ({
      ...thought,
      title: thought.title ?? "",
      summary: thought.summary ?? "",
      semanticLabel: thought.semanticLabel ?? "",
    })),
  }));

  // Keep the Zod validation here to ensure your UI remains type-safe
  return z.array(NotesJoinThoughtsParsedJSONPageSchema).parse(transformed);
};
