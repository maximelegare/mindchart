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
    createdAt: row.note_created_at ?? undefined,
    topicId: row.topic_id ?? undefined,
    topicName: row.topic_name ?? undefined,
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

  const result = z
    .array(NotesJoinThoughtsParsedJSONPageSchema)
    .safeParse(transformed);
  return result.success ? result.data : null;
};
