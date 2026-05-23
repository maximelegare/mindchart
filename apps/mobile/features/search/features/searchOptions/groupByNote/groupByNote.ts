import { SearchResultItemSchemaModel } from "@repo/zod-schemas";

export interface GroupedNoteResult {
  noteId: string;
  noteTitle: string;

  thoughts: Array<{
    categoryId: string;
    id: string;
    title: string;
    summary: string;
    createdAt: string | number;
  }>;
}

export function groupSearchResultsByNote(
  rows: SearchResultItemSchemaModel[]
): GroupedNoteResult[] {
  const map = new Map<string, GroupedNoteResult>();

  for (const row of rows) {
    if (!map.has(row.noteId)) {
      map.set(row.noteId, {
        noteId: row.noteId,
        // The first matched item sets the note context title
        noteTitle: row.noteTitle || "Untitled Note",
        thoughts: [],
      });
    }

    map.get(row.noteId)!.thoughts.push({
      id: row.id,
      title: row.thoughtTitle,
      summary: row.thoughtSummary,
      createdAt: row.createdAt,
      categoryId: row.categoryId,
    });
  }

  return Array.from(map.values());
}
