import { getPendingEmbeddingsQuery } from "./src/queries/embeddings/getPendingEmbeddings";
import { insertPendingEmbeddingsQuery } from "./src/queries/embeddings/insertPendingEmbeddings";
import { updatePendingEmbeddingsQuery } from "./src/queries/embeddings/updatePendingEmbeddings";
import { getAllNotesQuery } from "./src/queries/notes/getAllNotes";
import { getPaginatedNotesWithCountQuery } from "./src/queries/notes/getPaginatedNotes";
import {
  countNotesQuery,
  type NoteListFilters,
  type NoteListQueryParams,
  type NoteListSortBy,
} from "./src/queries/notes/noteListQuery";
import { insertNoteQuery } from "./src/queries/notes/insertNote";
import { getAllThoughtsQuery } from "./src/queries/thoughts/getAllThoughts";
import { getAllThoughtsGroupByCategoryQuery } from "./src/queries/thoughts/getAllThoughtsGroupByCategory";
import { insertThoughtsQuery } from "./src/queries/thoughts/insertThoughts";
import { getNotesWithAssociatedThoughtsQuery } from "./src/queries/thoughtsAndNotes/getNotesWithAssociatedThoughts";
import { getPaginatedNotesWithThoughtsAndCountQuery } from "./src/queries/thoughtsAndNotes/getPaginatedNotesWithAssociatedThoughts";
import { getAllThoughtsWithEmbeddingsQuery } from "./src/queries/thoughts/getAllThoughtsWithEmbeddings";
import { emptyDB } from "./src/utils/emtpyDB";
import { getOPDatabase } from "./src/utils/initialize/getOPDatabase";
import { getAllCategoriesQuery } from "./src/queries/categories/getAllcategories";
import { removeDatabaseFile } from "./src/utils/removeDatabaseFile";
import { setupDB } from "./src/utils/initialize/setupDB";
import {
  AppDataTable,
  CategoryTable,
  SettingTable,
  ThoughtTable,
  NoteTable,
  EmbeddingTable,
  FolderTable,
  PersonTable,
  PersonToNoteTable,
  FeelingTable,
  LocationTable,
} from "./src/schemas/app";
import { updateNoteFeelingQuery } from "./src/queries/notes/updateNoteFeeling";
import { updateNoteLocationQuery } from "./src/queries/notes/updateNoteLocation";
import { getAllLocationsQuery } from "./src/queries/locations/getAllLocations";
import { insertLocationQuery } from "./src/queries/locations/insertLocation";
import { deleteLocationByIdQuery } from "./src/queries/locations/deleteLocationById";
import { getAllPersonsQuery } from "./src/queries/persons/getAllPersons";
import { getPersonsByNoteIdQuery } from "./src/queries/persons/getPersonsByNoteId";
import { getPersonsByNoteIdsQuery } from "./src/queries/persons/getPersonsByNoteIds";
import { insertPersonQuery } from "./src/queries/persons/insertPerson";
import { upsertPersonsFromContactsQuery } from "./src/queries/persons/upsertPersonsFromContacts";
import { setNotePersonsQuery } from "./src/queries/persons/setNotePersons";
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
import { updateNoteQuery } from "./src/queries/notes/updateNote";
import { updateNoteLastViewedAtQuery } from "./src/queries/notes/updateNoteLastViewedAt";
import { updateThoughtsQuery } from "./src/queries/thoughts/updateThouhts";
import { updateEmbeddingsQuery } from "./src/queries/embeddings/updateEmbeddings";
import { deleteThoughByIdQuery } from "./src/queries/thoughts/deleteThoughById";
import { deleteThoughtsByIdsQuery } from "./src/queries/thoughts/deleteThoughtsByIds";
import { deleteNoteByIdQuery } from "./src/queries/notes/deleteNoteById";
import { searchThoughtsInFTSQuery } from "./src/queries/search/fts5/search";
import { getAllCategoriesWithThoughtsInfosQuery } from "./src/queries/categories/getAllCategoriesWithThoughtsInfos";
import {
  getAllCategoryTranslationsQuery,
  getCategoryTranslationsByLangQuery,
} from "./src/queries/categories/getCategoryTranslationsByLang";
import { getAllFoldersQuery } from "./src/queries/folders/getAllFolders";
import { getAllFoldersWithNotesInfosQuery } from "./src/queries/folders/getAllFoldersWithNotesInfos";
import { getFolderByIdQuery } from "./src/queries/folders/getFolderById";
import { getChildFoldersQuery } from "./src/queries/folders/getChildFolders";
import { insertFolderQuery } from "./src/queries/folders/insertFolder";
import { insertFoldersQuery } from "./src/queries/folders/insertFolders";
import { updateFolderLabelQuery } from "./src/queries/folders/updateFolderLabel";
import { moveFolderQuery } from "./src/queries/folders/moveFolder";
import { deleteFolderByPathQuery } from "./src/queries/folders/deleteFolderByPath";
import { getFolderContentsQuery } from "./src/queries/folders/getFolderContents";
import { updateNoteFolderIdQuery } from "./src/queries/notes/updateNoteFolderId";
export {
  MAX_FOLDER_DEPTH,
  buildRootFolderPath,
  buildChildFolderPath,
  getParentFolderPath,
  getFolderIdsFromPath,
  getFolderDepth,
  canCreateChildFolder,
  isFolderPathUnder,
  getSubtreeExtraDepth,
  canMoveFolderTo,
} from "./src/queries/folders/folderPath";
export {
  getMigratingStatusQuery,
  updateMigratingStatusQuery,
  getPendingEmbeddingsQuery,
  getSyncGraphDataQuery,
  getAllCategoriesQuery,
  insertPendingEmbeddingsQuery,
  updatePendingEmbeddingsQuery,
  getAllNotesQuery,
  getPaginatedNotesWithCountQuery,
  countNotesQuery,
  type NoteListFilters,
  type NoteListQueryParams,
  type NoteListSortBy,
  insertNoteQuery,
  getAllThoughtsQuery,
  getAllThoughtsGroupByCategoryQuery,
  insertThoughtsQuery,
  getNotesWithAssociatedThoughtsQuery,
  getPaginatedNotesWithThoughtsAndCountQuery,
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
  updateNoteQuery,
  updateNoteLastViewedAtQuery,
  updateThoughtsQuery,
  updateEmbeddingsQuery,
  deleteThoughByIdQuery,
  deleteThoughtsByIdsQuery,
  deleteNoteByIdQuery,
  searchThoughtsInFTSQuery,
  getAllCategoriesWithThoughtsInfosQuery,
  getAllCategoryTranslationsQuery,
  getCategoryTranslationsByLangQuery,
  getAllFoldersQuery,
  getAllFoldersWithNotesInfosQuery,
  getFolderByIdQuery,
  getChildFoldersQuery,
  insertFolderQuery,
  insertFoldersQuery,
  updateFolderLabelQuery,
  moveFolderQuery,
  deleteFolderByPathQuery,
  getFolderContentsQuery,
  updateNoteFolderIdQuery,
  FolderTable,
  PersonTable,
  PersonToNoteTable,
  FeelingTable,
  LocationTable,
  getAllPersonsQuery,
  getPersonsByNoteIdQuery,
  getPersonsByNoteIdsQuery,
  insertPersonQuery,
  upsertPersonsFromContactsQuery,
  setNotePersonsQuery,
  updateNoteFeelingQuery,
  updateNoteLocationQuery,
  getAllLocationsQuery,
  insertLocationQuery,
  deleteLocationByIdQuery,
};
