import z from "zod";
import {
  CategoriesJoinThoughtsParsedSchema,
  CategoriesJoinThoughtsParsedSchemaModel,
} from "@repo/zod-schemas/client";

const parseThoughtsJson = (thoughtsJson: unknown) => {
  if (typeof thoughtsJson === "string") return JSON.parse(thoughtsJson);
  if (Array.isArray(thoughtsJson)) return thoughtsJson;
  return [];
};

export const parseCategoriesWithThoughts = (
  data: unknown
): CategoriesJoinThoughtsParsedSchemaModel[] | null => {
  if (!data || !Array.isArray(data)) return null;

  const transformed = data
    .map((row) => ({
      id: row.category_id,
      name: row.category_name,
      color: row.category_color,
      createdAt: row.category_created_at,
      thoughts: parseThoughtsJson(row.thoughts_json).map(
        (thought: Record<string, unknown>) => ({
          id: thought.id,
          thoughtId: thought.thoughtId ?? thought.id,
          title: thought.title ?? "",
          summary: thought.summary ?? "",
          semanticLabel: thought.semanticLabel ?? "",
          categoryId: thought.categoryId ?? row.category_id,
          noteId: thought.noteId,
          createdAt: thought.createdAt ?? null,
          isCompletable: Boolean(thought.isCompletable),
          isCompleted: Boolean(thought.isCompleted),
        })
      ),
    }))
    .filter((category) => category.thoughts.length > 0);

  const result = z
    .array(CategoriesJoinThoughtsParsedSchema)
    .safeParse(transformed);
  if (!result.success) {
    console.error("parseCategoriesWithThoughts:", result.error);
    return null;
  }

  return result.data;
};
