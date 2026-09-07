import { SearchResultItemSchemaModel } from "@repo/zod-schemas";
import { searchUntitledNoteLabel } from "@/features/search/searchLabels";

export interface GroupedNoteResult {
  noteId: string;
  noteTitle: string;
  createdAt: string;
  transcriptSnippet: string;
  thoughts: Array<{
    categoryId: string;
    id: string;
    title: string;
    summary: string;
    createdAt: string | number;
  }>;
}

function isThoughtHit(row: SearchResultItemSchemaModel) {
  return Boolean(row.thoughtTitle || row.thoughtSummary);
}

export function groupSearchResultsByNote(
  rows: SearchResultItemSchemaModel[]
): GroupedNoteResult[] {
  const map = new Map<string, GroupedNoteResult>();

  for (const row of rows) {
    if (!map.has(row.noteId)) {
      map.set(row.noteId, {
        noteId: row.noteId,
        noteTitle: row.noteTitle || String(searchUntitledNoteLabel()),
        createdAt: row.createdAt,
        transcriptSnippet: row.transcriptSnippet ?? "",
        thoughts: [],
      });
    }

    const group = map.get(row.noteId)!;
    if (!group.transcriptSnippet && row.transcriptSnippet) {
      group.transcriptSnippet = row.transcriptSnippet;
    }
    if (!isThoughtHit(row)) continue;

    group.thoughts.push({
      id: row.id,
      title: row.thoughtTitle,
      summary: row.thoughtSummary,
      createdAt: row.createdAt,
      categoryId: row.categoryId,
    });
  }

  return Array.from(map.values());
}
