import { useAIController } from "./useAIController";
import { useCategoriesController } from "./useCategoriesController";
import { useDatabaseInspectorController } from "./useDatabaseInspectorController";
import { useEmbeddingsController } from "./useEmbeddingsContolller";
import { useFoldersController } from "./useFoldersController";
import { useGraphController } from "./useGraphController";
import { useNotesAndThoughtsController } from "./useNotesAndThoughtsController";
import { useSearchController } from "./useSearch";
import { useSettingsController } from "./useSettingsController";
import { useTopicsController } from "./useTopicsController";
import { usePersonsController } from "./usePersonsController";

// useEmbeddingsController is not imported here because of a client error related to useQuery

export const useControllers = () => ({
  ai: useAIController(),
  embeddings: useEmbeddingsController(),
  notesAndThoughts: useNotesAndThoughtsController(),
  categories: useCategoriesController(),
  folders: useFoldersController(),
  graph: useGraphController(),
  databaseInspector: useDatabaseInspectorController(),
  settings: useSettingsController(),
  topics: useTopicsController(),
  persons: usePersonsController(),
  search: useSearchController(),
});
