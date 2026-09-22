import { useMemo } from "react";
import capitalize from "@/utils/stringManipulations/capitalize";
import type {
  NotesJoinThoughtsParsedJSONPageSchemaModel,
  Thought,
} from "@repo/zod-schemas";

export type CategoryThoughtGroup = {
  id: string;
  name: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
  thoughts: Thought[];
};

/** Build category sections from a paginated page of notes (without-folders + groupBy categories). */
export const groupThoughtsByCategoryFromNotes = (
  notes: NotesJoinThoughtsParsedJSONPageSchemaModel[],
  categoryNameById: Map<string, string>,
  categoryColorById: Map<string, string>
): CategoryThoughtGroup[] | null => {
  if (!notes.length) return null;

  const byCategory = new Map<string, CategoryThoughtGroup>();

  for (const note of notes) {
    for (const thought of note.thoughts) {
      const categoryId = thought.categoryId ?? "uncategorized";
      if (!byCategory.has(categoryId)) {
        byCategory.set(categoryId, {
          id: categoryId,
          name:
            categoryNameById.get(categoryId) ??
            capitalize(categoryId.replace(/-/g, " ")),
          color: categoryColorById.get(categoryId) ?? "hsl(0, 0%, 84.3%)",
          createdAt: thought.createdAt ?? undefined,
          updatedAt: note.updatedAt ?? undefined,
          thoughts: [],
        });
      }
      const group = byCategory.get(categoryId)!;
      group.thoughts.push(thought);
      if (
        thought.createdAt &&
        (!group.createdAt || thought.createdAt > group.createdAt)
      ) {
        group.createdAt = thought.createdAt;
      }
      if (
        note.updatedAt &&
        (!group.updatedAt || note.updatedAt > group.updatedAt)
      ) {
        group.updatedAt = note.updatedAt;
      }
    }
  }

  const groups = Array.from(byCategory.values()).filter(
    (group) => group.thoughts.length > 0
  );
  return groups.length ? groups : null;
};

export const useCategoryGroupsFromPaginatedNotes = (
  notes: NotesJoinThoughtsParsedJSONPageSchemaModel[] | null,
  categories: { id: string; name: string; color: string }[] | undefined
) => {
  return useMemo(() => {
    if (!notes) return null;
    const nameById = new Map(
      (categories ?? []).map((category) => [category.id, category.name])
    );
    const colorById = new Map(
      (categories ?? []).map((category) => [category.id, category.color])
    );
    return groupThoughtsByCategoryFromNotes(notes, nameById, colorById);
  }, [categories, notes]);
};
