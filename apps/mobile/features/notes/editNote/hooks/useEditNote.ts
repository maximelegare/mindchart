import { useControllers } from "@/api/controllers/useControllers";
import { Note, Thought } from "@repo/zod-schemas";

export const useEditNote = () => {
  const { embeddings, notesAndThoughts } = useControllers();

  const {
    useGenerateLocalEmbeddingsMutation,
    useUpdateEmbeddingsMutation,
    useInsertEmbeddingsMutation,
  } = embeddings;
  const { useUpdateNoteAndThoughtsMutation, useDeleteThoughtsByIdsMutation } =
    notesAndThoughts;
  const { mutateAsync: generateLocalEmbeddingsMutateAsync } =
    useGenerateLocalEmbeddingsMutation();

  const { mutateAsync: insertEmbeddingsMutateAsync } =
    useInsertEmbeddingsMutation();
  const { mutateAsync: updateEmbeddingsMutateAsync } =
    useUpdateEmbeddingsMutation();
  const { mutateAsync: updateNoteAndThoughtsMutateAsync } =
    useUpdateNoteAndThoughtsMutation();
  const { mutateAsync: deleteThoughtsByIdsMutateAsync } =
    useDeleteThoughtsByIdsMutation();

  const editNoteAction = async (
    note: Note,
    thoughts: (Thought & { status: "new" | "updated" })[],
    thoughtsToDelete: string[]
  ) => {
    const generatedEmbeddings = await generateLocalEmbeddingsMutateAsync({
      thoughts,
    });

    const newThoughtIdSet = new Set(
      thoughts.filter((t) => t.status === "new").map((t) => t.id)
    );
    const embeddingsToInsert = generatedEmbeddings.filter((e) =>
      newThoughtIdSet.has(e.thoughtId)
    );
    const embeddingsToUpdate = generatedEmbeddings.filter(
      (e) => !newThoughtIdSet.has(e.thoughtId)
    );

    await updateNoteAndThoughtsMutateAsync({ note, thoughts });

    if (embeddingsToInsert.length > 0) {
      await insertEmbeddingsMutateAsync({ data: embeddingsToInsert });
    }
    if (embeddingsToUpdate.length > 0) {
      await updateEmbeddingsMutateAsync({ data: embeddingsToUpdate });
    }

    await deleteThoughtsByIdsMutateAsync({ ids: thoughtsToDelete });
  };

  return {
    editNoteAction,
  };
};
