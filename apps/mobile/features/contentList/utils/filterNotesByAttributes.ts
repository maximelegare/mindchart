import type { FeelingValue } from "@repo/zod-schemas/src/schemas";

export type NoteAttributeFilters = {
  personIds: string[];
  feelings: FeelingValue[];
  locationIds: string[];
};

type FilterableNote = {
  feeling?: FeelingValue | null;
  locationId?: string | null;
  persons?: { id: string }[] | null;
};

export const hasActiveAttributeFilters = (
  filters: NoteAttributeFilters
): boolean =>
  filters.personIds.length > 0 ||
  filters.feelings.length > 0 ||
  filters.locationIds.length > 0;

export const filterNotesByAttributes = <T extends FilterableNote>(
  notes: T[],
  filters: NoteAttributeFilters
): T[] => {
  if (!hasActiveAttributeFilters(filters)) return notes;

  const personIds = new Set(filters.personIds);
  const feelings = new Set(filters.feelings);
  const locationIds = new Set(filters.locationIds);

  return notes.filter((note) => {
    if (personIds.size > 0) {
      const notePersonIds = note.persons?.map((person) => person.id) ?? [];
      if (!notePersonIds.some((id) => personIds.has(id))) return false;
    }

    if (feelings.size > 0) {
      if (note.feeling == null || !feelings.has(note.feeling)) return false;
    }

    if (locationIds.size > 0) {
      if (!note.locationId || !locationIds.has(note.locationId)) return false;
    }

    return true;
  });
};
