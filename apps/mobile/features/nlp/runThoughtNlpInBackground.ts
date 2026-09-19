import { InteractionManager } from "react-native";
import { QueryClient } from "@tanstack/react-query";
import { Thought } from "@repo/zod-schemas";
import { invalidateNotesAndThoughtsQueries } from "@/api/utils/invalidateNotesAndThoughtsQueries";
import { applyLocalThoughtNlp } from "./applyLocalThoughtNlp";

export const runThoughtNlpInBackground = (
  thoughts: Thought[],
  queryClient?: QueryClient
) => {
  InteractionManager.runAfterInteractions(() => {
    void (async () => {
      try {
        await applyLocalThoughtNlp(thoughts);
        if (queryClient) {
          await invalidateNotesAndThoughtsQueries(queryClient);
        }
      } catch (error) {
        console.warn("Background thought NLP failed:", error);
      }
    })();
  });
};
