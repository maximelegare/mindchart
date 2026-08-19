import {
  getPaginatedNotesWithCountQuery,
  getOPDatabase,
  type NoteListQueryParams,
} from "@repo/sqlite";

export type PaginatedNotesRequest = NoteListQueryParams;

export type PaginatedNotesResponse = Awaited<
  ReturnType<typeof getPaginatedNotesWithCountQuery>
>;

export const fetchPaginatedNotes = async (params: PaginatedNotesRequest) => {
  const db = getOPDatabase();
  return getPaginatedNotesWithCountQuery(db, params);
};
