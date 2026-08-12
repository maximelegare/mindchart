import { useControllers } from "@/api/controllers/useControllers";
import { warmupGraphLayouts } from "../components/graphSkia";
import { buildGraphByFolder } from "../utils/buildGraphByFolder";
import { buildGraphByCategoryFolders } from "../utils/buildGraphByCategoryFolders";
import {
  GRAPH_CACHE_VERSION,
  stripEmbeddingsFromCache,
} from "../utils/parseGraphData";
import { Note, ThoughtWithEmbedding } from "@repo/zod-schemas";
import { Folder } from "@repo/zod-schemas/src/schemas";
import { useEffect, useMemo, useRef } from "react";
import { useWorkspacesStore } from "@/features/workspaces/context/workspacesContext";
import { normalizeNotesFromQuery } from "@/features/contentList/utils/normalizeNotesFromQuery";
import { GraphDataCache, NodeDatum } from "../types/types";

export type { NodeDatum };

/** Fallback when the notes query fails to parse — one note per distinct noteId. */
const deriveNotesFromThoughts = (thoughts: ThoughtWithEmbedding[]): Note[] => {
  const byNote = new Map<string, Note>();
  for (const thought of thoughts) {
    if (!thought.noteId || byNote.has(thought.noteId)) continue;
    byNote.set(thought.noteId, {
      id: thought.noteId,
      title: thought.title || "Untitled",
      summary: thought.summary || "",
      rawText: "",
      folderId: thought.folderId ?? undefined,
      folderLabel: thought.folderLabel ?? undefined,
      createdAt: thought.createdAt ?? undefined,
    });
  }
  return Array.from(byNote.values());
};

const thoughtIdsByNoteIdFrom = (thoughts: ThoughtWithEmbedding[]) => {
  const map = new Map<string, string[]>();
  for (const thought of thoughts) {
    if (!thought.noteId) continue;
    const list = map.get(thought.noteId) ?? [];
    list.push(thought.thoughtId);
    map.set(thought.noteId, list);
  }
  return map;
};

/**
 * Graph hierarchies are always built from live SQLite rows:
 * - folder mode → notes table (one leaf per note)
 * - category mode → thoughts (unchanged)
 *
 * The persisted graph_data blob is only a warm-cache write, never the source
 * of truth for folder leaves (that was showing thought-count "note" nodes).
 */
export const useGraph = () => {
  const { graph, notesAndThoughts, folders } = useControllers();

  const { useUpdateGraphDataMutation, useFetchSyncGraphQuery } = graph;
  const { useFetchAllThoughtsWithEmbeddingsQuery, useFetchAllNotesQuery } =
    notesAndThoughts;
  const { useFetchAllFoldersQuery } = folders;

  const { mutateAsync: mutateGraph } = useUpdateGraphDataMutation();
  const { refetch: refetchSyncGraph } = useFetchSyncGraphQuery({
    staleTime: 30_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const {
    data: thoughts,
    isFetching: thoughtsIsFetching,
    refetch: refetchThoughts,
  } = useFetchAllThoughtsWithEmbeddingsQuery({
    staleTime: 0,
  });

  const {
    data: notesData,
    isFetching: notesIsFetching,
    refetch: refetchNotes,
  } = useFetchAllNotesQuery({
    staleTime: 0,
  });

  const {
    data: allFolders,
    isFetching: foldersIsFetching,
    refetch: refetchFolders,
  } = useFetchAllFoldersQuery({
    staleTime: 0,
  });

  const activeWorkspaceId = useWorkspacesStore((s) => s.activeWorkspaceId);
  const persistedKeyRef = useRef<string | null>(null);

  const typedThoughts = useMemo(
    () => (thoughts ?? []) as ThoughtWithEmbedding[],
    [thoughts]
  );
  const notes = useMemo(() => {
    const fromQuery = normalizeNotesFromQuery(notesData);
    if (fromQuery) return fromQuery;
    return typedThoughts.length ? deriveNotesFromThoughts(typedThoughts) : [];
  }, [notesData, typedThoughts]);
  const folderList = useMemo(
    () => (allFolders ?? []) as Folder[],
    [allFolders]
  );
  const thoughtIdsByNoteId = useMemo(
    () => thoughtIdsByNoteIdFrom(typedThoughts),
    [typedThoughts]
  );

  const hierarchies: GraphDataCache | null = useMemo(() => {
    // Wait for all three queries so folder mode never paints thought-shaped
    // leaves from a fallback before real notes arrive.
    if (
      notesData === undefined ||
      thoughts === undefined ||
      allFolders === undefined
    ) {
      return null;
    }

    return {
      version: GRAPH_CACHE_VERSION,
      category: buildGraphByCategoryFolders(
        folderList,
        typedThoughts
      ) as NodeDatum,
      folder: buildGraphByFolder(folderList, notes, {
        thoughtIdsByNoteId,
      }) as NodeDatum,
    };
  }, [
    notesData,
    thoughts,
    allFolders,
    folderList,
    notes,
    typedThoughts,
    thoughtIdsByNoteId,
  ]);

  // Persist + warm layouts when the live hierarchies change.
  useEffect(() => {
    if (!hierarchies) return;

    const key = [
      activeWorkspaceId,
      GRAPH_CACHE_VERSION,
      notes
        .map((n) => n.id)
        .sort()
        .join(","),
      typedThoughts
        .map((t) => t.thoughtId)
        .sort()
        .join(","),
      folderList
        .map((f) => `${f.id}:${f.path}`)
        .sort()
        .join(","),
    ].join("::");

    if (persistedKeyRef.current === key) return;
    persistedKeyRef.current = key;

    const id = setTimeout(() => {
      warmupGraphLayouts(hierarchies);
      void mutateGraph(stripEmbeddingsFromCache(hierarchies));
    }, 0);

    return () => clearTimeout(id);
  }, [
    hierarchies,
    activeWorkspaceId,
    notes,
    typedThoughts,
    folderList,
    mutateGraph,
  ]);

  useEffect(() => {
    persistedKeyRef.current = null;
  }, [activeWorkspaceId]);

  const isLoading =
    !hierarchies &&
    (notesIsFetching || foldersIsFetching || thoughtsIsFetching);

  return {
    syncGraph: false,
    hierarchies,
    isLoading,
    refetchGraph: async () => {
      await Promise.all([refetchThoughts(), refetchNotes(), refetchFolders()]);
    },
    refetchSyncFlag: refetchSyncGraph,
  };
};
