import z from "zod";
import {
  assembleThought,
  CategoriesJoinThoughtsParsedSchema,
  CategoriesJoinThoughtsParsedSchemaModel,
} from "@repo/zod-schemas";

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
      thoughts: parseThoughtsJson(row.thoughts_json)
        .filter(Boolean)
        .map((thought: Record<string, unknown>) =>
          assembleThought({
            ...thought,
            categoryId: thought.categoryId ?? row.category_id,
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
