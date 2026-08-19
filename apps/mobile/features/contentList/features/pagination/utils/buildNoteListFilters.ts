import type { NoteListFilters } from "@repo/sqlite";
import type { OptionsBar } from "@/features/contentList/types";
import type { NoteAttributeFilters } from "@/features/contentList/utils/filterNotesByAttributes";

export const buildNoteListFilters = (
  options: Pick<
    OptionsBar,
    "selectedFolderId" | "selectedCategoryId" | "groupBy"
  > &
    NoteAttributeFilters
): NoteListFilters => {
  const filters: NoteListFilters = {};

  if (options.selectedFolderId) {
    filters.folderId = options.selectedFolderId;
  }

  if (options.groupBy === "categories" && options.selectedCategoryId) {
    filters.categoryId = options.selectedCategoryId;
  }

  if (options.personIds.length) {
    filters.personIds = options.personIds;
  }

  if (options.feelings.length) {
    filters.feelings = options.feelings;
  }

  if (options.locationIds.length) {
    filters.locationIds = options.locationIds;
  }

  return filters;
};
