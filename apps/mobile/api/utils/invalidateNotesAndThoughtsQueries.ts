import { QueryClient } from "@tanstack/react-query";
import { REACT_QUERY_KEYS } from "../endpoints/KEYS";

const NOTES_LIST_QUERY_KEYS = [
  REACT_QUERY_KEYS.fetchNotesAndThoughts,
  REACT_QUERY_KEYS.fetchNotes,
  REACT_QUERY_KEYS.fetchAllTopicsWithNotesInfos,
  REACT_QUERY_KEYS.fetchAllTopics,
  REACT_QUERY_KEYS.fetchNoteDetails,
  REACT_QUERY_KEYS.fetchAllThoughtsGroupByCategory,
] as const;

const NOTES_AND_THOUGHTS_QUERY_KEYS = [
  REACT_QUERY_KEYS.fetchAllThoughtsWithEmbeddings,
  REACT_QUERY_KEYS.fetchThoughts,
  REACT_QUERY_KEYS.fetchGraphData,
  REACT_QUERY_KEYS.seedDatabase,
  REACT_QUERY_KEYS.fetchNoteByTopic,
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

export const invalidateNotesAndThoughtsQueries = async (
  queryClient: QueryClient
) => {
  await invalidateNotesListQueries(queryClient);
  await Promise.all(
    NOTES_AND_THOUGHTS_QUERY_KEYS.map((queryKey) =>
      queryClient.refetchQueries({
        queryKey: [queryKey],
        type: "all",
      })
    )
  );
};
