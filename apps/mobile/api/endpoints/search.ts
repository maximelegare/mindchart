import {
  getOPDatabase,
  searchThoughtsInFTSQuery,
  type SearchNotesQueryOptions,
} from "@repo/sqlite";

export type SearchNotesParams = {
  query: string;
} & SearchNotesQueryOptions;

export const searchNotes = async ({
  query,
  includeTranscript = false,
  limit,
  offset,
}: SearchNotesParams) => {
  const db = getOPDatabase();
  return await searchThoughtsInFTSQuery(db, query, {
    includeTranscript,
    limit,
    offset,
  });
};
