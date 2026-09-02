import { useMemo } from "react";
import capitalize from "@/utils/stringManipulations/capitalize";
import type { NotesJoinThoughtsParsedJSONPageSchemaModel } from "@repo/zod-schemas/client";

export type CategoryThoughtGroup = {
  id: string;
  name: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
  thoughts: {
    id: string;
    thoughtId: string;
    title: string;
    summary: string;
    semanticLabel: string;
    categoryId: string;
    noteId?: string;
    createdAt?: string | null;
    isCompletable: boolean;
    isCompleted: boolean;
  }[];
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
      group.thoughts.push({
        id: thought.id,
        thoughtId: thought.thoughtId ?? thought.id,
        title: thought.title ?? "",
        summary: thought.summary ?? "",
        semanticLabel: thought.semanticLabel ?? "",
        categoryId,
        noteId: thought.noteId ?? note.id,
        createdAt: thought.createdAt ?? null,
        isCompletable: thought.isCompletable ?? false,
        isCompleted: thought.isCompleted ?? false,
      });
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
