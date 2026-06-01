import { getPendingEmbeddingsQuery } from "./src/queries/embeddings/getPendingEmbeddings";
import { insertPendingEmbeddingsQuery } from "./src/queries/embeddings/insertPendingEmbeddings";
import { updatePendingEmbeddingsQuery } from "./src/queries/embeddings/updatePendingEmbeddings";
import { getAllNotesQuery } from "./src/queries/notes/getAllNotes";
import { insertNoteQuery } from "./src/queries/notes/insertNote";
import { getAllThoughtsQuery } from "./src/queries/thoughts/getAllThoughts";
import { insertThoughtsQuery } from "./src/queries/thoughts/insertThoughts";
import { getNotesWithAssociatedThoughtsQuery } from "./src/queries/thoughtsAndNotes/getNotesWithAssociatedThoughts";
import { getAllThoughtsWithEmbeddingsQuery } from "./src/queries/thoughts/getAllThoughtsWithEmbeddings";
import { emptyDB } from "./src/utils/emtpyDB";
import { getOPDatabase } from "./src/utils/initialize/getOPDatabase";
import { getAllCategoriesQuery } from "./src/queries/categories/getAllcategories";
import { removeDatabaseFile } from "./src/utils/removeDatabaseFile";
import { setupDB } from "./src/utils/initialize/setupDB";
import { insertNewTopicQuery } from "./src/queries/topics/insertNewTopic";
import {
  AppDataTable,
  CategoryTable,
  SettingTable,
  ThoughtTable,
  NoteTable,
  EmbeddingTable,
} from "./src/schemas/app";
import { getGraphDataQuery } from "./src/queries/graph/getGraphData";
import { updateGraphDataQuery } from "./src/queries/graph/updateGraphData";
import { getSyncGraphDataQuery } from "./src/queries/graph/getSyncGraphData";
import { updateSyncGraphDataQuery } from "./src/queries/graph/updateSyncGraphData";
import { getMigratingStatusQuery } from "./src/queries/databaseInspector/getMigratingStatus";
import { updateMigratingStatusQuery } from "./src/queries/databaseInspector/updateMigratingStatus";
import { getNoteByIdWithAssociatedThoughtsQuery } from "./src/queries/thoughtsAndNotes/getNoteByIdWithAssociatedThoughts";
import { exportDatabaseQuery } from "./src/queries/settings/exportDatabase";
import {
  closeOPDatabase,
  setActiveWorkspace,
  setWorkspaceEncryptionKey,
  getActiveDbName,
  getDbLocation,
} from "./src/utils/initialize/getOPDatabase";
import { WorkspaceEncryptionKeyMissingError } from "./src/utils/initialize/workspaceEncryptionKeyMissingError";
export * from "./src/data/settings";
import { useMigrationHelper } from "./src/utils/useMigrationHelper";
import { runMigrations } from "./src/utils/runMigrations";
import { validateIfDBExists } from "./src/queries/dbStatus/validateIfDBExists";
import { insertEmbeddingsQuery } from "./src/queries/embeddings/insertEmbeddings";
import { seedDatabaseQuery } from "./src/queries/bulk/seedDatabase";
import { getAllTopicsQuery } from "./src/queries/topics/getAllTopics";
import { updateNoteQuery } from "./src/queries/notes/updateNote";
import { updateThoughtsQuery } from "./src/queries/thoughts/updateThouhts";
import { updateEmbeddingsQuery } from "./src/queries/embeddings/updateEmbeddings";
import { deleteThoughByIdQuery } from "./src/queries/thoughts/deleteThoughById";
import { deleteThoughtsByIdsQuery } from "./src/queries/thoughts/deleteThoughtsByIds";
import { deleteNoteByIdQuery } from "./src/queries/notes/deleteNoteById";
import { searchThoughtsInFTSQuery } from "./src/queries/search/fts5/search";

export {
  getMigratingStatusQuery,
  updateMigratingStatusQuery,
  getPendingEmbeddingsQuery,
  getSyncGraphDataQuery,
  getAllCategoriesQuery,
  insertPendingEmbeddingsQuery,
  updatePendingEmbeddingsQuery,
  getAllNotesQuery,
  insertNoteQuery,
  getAllThoughtsQuery,
  insertThoughtsQuery,
  getNotesWithAssociatedThoughtsQuery,
  emptyDB,
  getOPDatabase,
  removeDatabaseFile,
  getAllThoughtsWithEmbeddingsQuery,
  setupDB,
  getGraphDataQuery,
  updateSyncGraphDataQuery,
  updateGraphDataQuery,
  getNoteByIdWithAssociatedThoughtsQuery,
  insertEmbeddingsQuery,
  exportDatabaseQuery,
  AppDataTable,
  CategoryTable,
  SettingTable,
  ThoughtTable,
  NoteTable,
  EmbeddingTable,
  validateIfDBExists,
  useMigrationHelper,
  runMigrations,
  closeOPDatabase,
  setActiveWorkspace,
  setWorkspaceEncryptionKey,
  getActiveDbName,
  getDbLocation,
  WorkspaceEncryptionKeyMissingError,
  seedDatabaseQuery,
  getAllTopicsQuery,
  insertNewTopicQuery,
  updateNoteQuery,
  updateThoughtsQuery,
  updateEmbeddingsQuery,
  deleteThoughByIdQuery,
  deleteThoughtsByIdsQuery,
  deleteNoteByIdQuery,
  searchThoughtsInFTSQuery,
};
