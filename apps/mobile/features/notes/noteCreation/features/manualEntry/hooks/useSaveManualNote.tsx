import { useCallback } from "react";
import { Note, Thought } from "@repo/zod-schemas";
import { useControllers } from "@/api/controllers/useControllers";
import { useModal } from "@/components/ui/modal/modal";
import { LoadingState } from "@/components/ui/modal/custom/loadingState/loadingState";
import { loadingModalSavingNoteTitle } from "@/components/ui/modal/data/loadingModalLabels";

export const useSaveManualNote = (onSuccess?: () => void) => {
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
            thought.summary.trim(),
        }));

        const embeddings = await generateLocalEmbeddingsMutateAsync({
          thoughts: thoughtsWithLabels,
        });

        await insertNoteAndThoughtsMutateAsync({
          note,
          thoughts: thoughtsWithLabels,
        });
        await insertEmbeddingsMutateAsync({ data: embeddings });

        onSuccess?.();
        closeModal();
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
    ]
  );

  return { saveManualNote };
};
