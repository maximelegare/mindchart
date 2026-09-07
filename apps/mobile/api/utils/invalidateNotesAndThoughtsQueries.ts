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

function patchThoughtsJson(
  thoughtsJson: unknown,
  thoughtId: string,
  isCompleted: boolean
): unknown {
  let thoughts: unknown[] | null = null;
  let asString = false;
  if (typeof thoughtsJson === "string") {
    try {
      const parsed = JSON.parse(thoughtsJson);
      if (!Array.isArray(parsed)) return thoughtsJson;
      thoughts = parsed;
      asString = true;
    } catch {
      return thoughtsJson;
    }
  } else if (Array.isArray(thoughtsJson)) {
    thoughts = thoughtsJson;
  } else {
    return thoughtsJson;
  }

  const next = thoughts.map((thought) => {
    if (!thought || typeof thought !== "object") return thought;
    const row = thought as { id?: string; thoughtId?: string };
    if (row.id !== thoughtId && row.thoughtId !== thoughtId) return thought;
    return { ...thought, isCompleted };
  });
  return asString ? JSON.stringify(next) : next;
}

/** Keep note-details HTML in sync when a checklist is toggled in view mode. */
export const patchThoughtCompletionInNoteDetailsCache = (
  queryClient: QueryClient,
  thoughtId: string,
  isCompleted: boolean
) => {
  queryClient.setQueriesData(
    { queryKey: [REACT_QUERY_KEYS.fetchNoteDetails] },
    (data) => {
      if (!Array.isArray(data)) return data;
      return data.map((row) => {
        if (!row || typeof row !== "object") return row;
        const next = row as { thoughts_json?: unknown };
        return {
          ...next,
          thoughts_json: patchThoughtsJson(
            next.thoughts_json,
            thoughtId,
            isCompleted
          ),
        };
      });
    }
  );
};
