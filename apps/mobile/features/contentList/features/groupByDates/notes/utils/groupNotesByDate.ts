import type { SortDirection, SortField } from "@/features/contentList/types";

export const UNDATED_GROUP_KEY = "undated";

export type DateNotesGroup<T> = {
  id: string;
  dateKey: string;
  notes: T[];
};

type NoteWithDates = {
  createdAt?: string | null;
  updatedAt?: string | null;
  lastViewedAt?: string | null;
};

export const toDateKey = (value?: string | Date | null): string | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const dateValueForSortField = (
  note: NoteWithDates,
  field: SortField
): string | null | undefined => {
  if (field === "lastViewed") return note.lastViewedAt;
  if (field === "updatedAt") return note.updatedAt;
  return note.createdAt;
};

export const groupNotesByDate = <T extends NoteWithDates>(
  notes: T[],
  field: SortField,
  direction: SortDirection
): DateNotesGroup<T>[] | null => {
  if (!notes.length) return null;

  const groupsByKey = new Map<string, DateNotesGroup<T>>();

  for (const note of notes) {
    const dateKey =
      toDateKey(dateValueForSortField(note, field)) ?? UNDATED_GROUP_KEY;
    const existing = groupsByKey.get(dateKey);
    if (existing) {
      existing.notes.push(note);
    } else {
      groupsByKey.set(dateKey, {
        id: dateKey,
        dateKey,
        notes: [note],
      });
    }
  }

  const groups = Array.from(groupsByKey.values());
  const fromBeginning = direction === "asc";

  groups.sort((a, b) => {
    if (a.dateKey === UNDATED_GROUP_KEY) return 1;
    if (b.dateKey === UNDATED_GROUP_KEY) return -1;
    const compared = a.dateKey.localeCompare(b.dateKey);
    return fromBeginning ? -compared : compared;
  });

  return groups.length ? groups : null;
};
