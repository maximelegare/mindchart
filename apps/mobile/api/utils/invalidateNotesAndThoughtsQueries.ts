import { QueryClient } from "@tanstack/react-query";
import { REACT_QUERY_KEYS } from "../endpoints/KEYS";

const NOTES_LIST_QUERY_KEYS = [
  REACT_QUERY_KEYS.fetchNotesAndThoughts,
  REACT_QUERY_KEYS.fetchNotes,
  REACT_QUERY_KEYS.fetchPaginatedNotes,
  REACT_QUERY_KEYS.fetchPaginatedNotesAndThoughts,
  REACT_QUERY_KEYS.fetchAllFoldersWithNotesInfos,
  REACT_QUERY_KEYS.fetchNoteDetails,
  REACT_QUERY_KEYS.fetchAllThoughtsGroupByCategory,
] as const;

const NOTES_AND_THOUGHTS_QUERY_KEYS = [
  REACT_QUERY_KEYS.fetchAllThoughtsWithEmbeddings,
  REACT_QUERY_KEYS.fetchThoughts,
  REACT_QUERY_KEYS.fetchGraphData,
  REACT_QUERY_KEYS.seedDatabase,
] as const;

/** Folder tree / cards — seed and note moves change these; must not stay warm for 60s. */
const FOLDER_QUERY_KEYS = [
  REACT_QUERY_KEYS.fetchAllFolders,
  REACT_QUERY_KEYS.fetchAllFoldersWithNotesInfos,
  REACT_QUERY_KEYS.fetchChildFolders,
  REACT_QUERY_KEYS.fetchFolderById,
  REACT_QUERY_KEYS.fetchFolderContents,
] as const;

export const invalidateNotesListQueries = async (queryClient: QueryClient) => {
  await Promise.all(
    NOTES_LIST_QUERY_KEYS.map((queryKey) =>
      queryClient.refetchQueries({
        queryKey: [queryKey],
        type: "all",
      })
    )
  );
};

export const invalidateFolderQueries = async (queryClient: QueryClient) => {
  await Promise.all(
    FOLDER_QUERY_KEYS.map((queryKey) =>
      queryClient.invalidateQueries({
        queryKey: [queryKey],
      })
    )
  );
};

export const invalidateNotesAndThoughtsQueries = async (
  queryClient: QueryClient
) => {
  await invalidateNotesListQueries(queryClient);
  await Promise.all([
    ...NOTES_AND_THOUGHTS_QUERY_KEYS.map((queryKey) =>
      queryClient.refetchQueries({
        queryKey: [queryKey],
        type: "all",
      })
    ),
    invalidateFolderQueries(queryClient),
  ]);
};
