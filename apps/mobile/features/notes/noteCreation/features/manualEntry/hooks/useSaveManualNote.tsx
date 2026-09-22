import { useCallback } from "react";
import { Note, Thought, getThoughtPlainText } from "@repo/zod-schemas";
import { useQueryClient } from "@tanstack/react-query";
import { useControllers } from "@/api/controllers/useControllers";
import { useModal } from "@/components/ui/modal/modal";
import { LoadingState } from "@/components/ui/modal/custom/loadingState/loadingState";
import { loadingModalSavingNoteTitle } from "@/components/ui/modal/data/loadingModalLabels";
import { runThoughtNlpInBackground } from "@/features/nlp/runThoughtNlpInBackground";

export const useSaveManualNote = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { openModal, closeModal } = useModal();
  const { notesAndThoughts, embeddings } = useControllers();

  const { useInsertNoteAndThoughtsMutation } = notesAndThoughts;
  const { useInsertEmbeddingsMutation, useGenerateLocalEmbeddingsMutation } =
    embeddings;

  const { mutateAsync: insertNoteAndThoughtsMutateAsync } =
    useInsertNoteAndThoughtsMutation();
  const { mutateAsync: generateLocalEmbeddingsMutateAsync } =
    useGenerateLocalEmbeddingsMutation();
  const { mutateAsync: insertEmbeddingsMutateAsync } =
    useInsertEmbeddingsMutation();

  const saveManualNote = useCallback(
    async (note: Note, thoughts: Thought[]) => {
      openModal({
        dismissOnBackgroundPress: false,
        customContent: () => (
          <LoadingState title={loadingModalSavingNoteTitle()} size="large" />
        ),
      });

      try {
        const thoughtsWithLabels = thoughts.map((thought) => ({
          ...thought,
          semanticLabel:
            thought.semanticLabel.trim() ||
            thought.title.trim() ||
            getThoughtPlainText(thought).trim(),
        }));

        await insertNoteAndThoughtsMutateAsync({
          note,
          thoughts: thoughtsWithLabels,
        });

        onSuccess?.();
        closeModal();

        runThoughtNlpInBackground(thoughtsWithLabels, queryClient);
        void (async () => {
          try {
            const embeddings = await generateLocalEmbeddingsMutateAsync({
              thoughts: thoughtsWithLabels,
            });
            await insertEmbeddingsMutateAsync({ data: embeddings });
          } catch (error) {
            console.warn("Background embeddings failed:", error);
          }
        })();
      } catch (error) {
        console.error("Error saving manual note:", error);
        closeModal();
      }
    },
    [
      closeModal,
      generateLocalEmbeddingsMutateAsync,
      insertEmbeddingsMutateAsync,
      insertNoteAndThoughtsMutateAsync,
      onSuccess,
      openModal,
      queryClient,
    ]
  );

  return { saveManualNote };
};
