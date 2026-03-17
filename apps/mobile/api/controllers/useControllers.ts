import { useCategoriesController } from "./useCategoriesController";
import { useDatabaseInspectorController } from "./useDatabaseInspectorController";
import { useEmbeddingsController } from "./useEmbeddingsContolller";
import { useGraphController } from "./useGraphController";
import { useNotesAndThoughtsController } from "./useNotesAndThoughtsController";
import { useSettingsController } from "./useSettingsController";

// useEmbeddingsController is not imported here because of a client error related to useQuery

export const useControllers = () => ({
  embeddings: useEmbeddingsController(),
  notesAndThoughts: useNotesAndThoughtsController(),
  categories: useCategoriesController(),
  graph: useGraphController(),
  databaseInspector: useDatabaseInspectorController(),
  settings: useSettingsController(),
});
