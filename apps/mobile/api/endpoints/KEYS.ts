import { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";

export type ReactQueryOptions = Omit<
  UseQueryOptions<any, any, any, any>,
  "queryKey" | "queryFn" | "initialData"
>;

export type InferMutationOptions<F extends (...args: any) => any> =
  UseMutationOptions<
    // TData
    Awaited<ReturnType<F>>,
    // TError
    unknown,
    // TVariables
    Parameters<F>[0],
    // TContext
    unknown
  >;

export const REACT_QUERY_KEYS = {
  transcribeService: "transcribe_service",
  generateContentService: "generate_content_service",
  fetchAllCategoriesWithThoughtsInfos:
    "fetch_all_categories_with_thoughts_infos",
  fetchNoteByTopic: "fetch_note_by_topic",
  fetchAllThoughtsGroupByCategory: "fetch_all_thoughts_group_by_category",
  fetchAllTopicsWithNotesInfos: "fetch_all_topics_with_notes_infos",
  deleteTopicById: "delete_topic_by_id",
  updateTopicById: "update_topic_by_id",
  searchNotes: "search_notes",
  deleteNoteById: "delete_note_by_id",
  deleteThoughtsByIds: "delete_thoughts_by_ids",
  updateEmbeddings: "update_embeddings",
  updateNoteAndThoughts: "update_note_and_thoughts",
  fetchAllTopics: "fetch_all_topics",
  insertNewTopic: "insert_new_topic",
  seedDatabase: "seed_database",
  generateLocalEmbeddings: "generate_local_embeddings",
  insertEmbeddings: "insert_embeddings",
  exportDatabase: "export_database",
  importDatabase: "import_database",
  fetchAllCategories: "fetch_all_categories",
  generateNote: "generate_note",
  insertNoteAndThoughts: "insert_note_and_thoughts",
  fetchNotes: "fetch_notes",
  fetchThoughts: "fetch_thoughts",
  fetchNotesAndThoughts: "fetch_notes_and_thoughts",
  fetchAllThoughtsWithEmbeddings: "fetch_all_thoughts_with_embeddings",
  fetchGraphData: "fetch_graph_data",
  updateGraphData: "update_graph_data",
  updateSyncGraphData: "updateSyncGraphData",
  fetchSyncGraph: "fetch_sync_graph",
  fetchPendingEmbeddings: "fetch_pending_embeddings",
  fetchMigratingStatus: "fetch_migrating_status",
  updateMigratingStatus: "update_migrating_status",
  fetchNoteDetails: "fetch_note_details",
} as const;
