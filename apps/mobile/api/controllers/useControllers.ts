import { useAIController } from "./useAIController";
import { useCategoriesController } from "./useCategoriesController";
import { useCategoryLabelsController } from "./useCategoryLabelsController";
import { useDatabaseInspectorController } from "./useDatabaseInspectorController";
import { useEmbeddingsController } from "./useEmbeddingsContolller";
import { useFoldersController } from "./useFoldersController";
import { useGraphController } from "./useGraphController";
import { useNotesAndThoughtsController } from "./useNotesAndThoughtsController";
import { useSearchController } from "./useSearch";
import { useSettingsController } from "./useSettingsController";
import { usePersonsController } from "./usePersonsController";
import { useLocationsController } from "./useLocationsController";

// useEmbeddingsController is not imported here because of a client error related to useQuery

export const useControllers = () => ({
  ai: useAIController(),
  embeddings: useEmbeddingsController(),
  notesAndThoughts: useNotesAndThoughtsController(),
  categories: useCategoriesController(),
  categoryLabels: useCategoryLabelsController(),
  folders: useFoldersController(),
  graph: useGraphController(),
  databaseInspector: useDatabaseInspectorController(),
  settings: useSettingsController(),
  persons: usePersonsController(),
  locations: useLocationsController(),
  search: useSearchController(),
});
