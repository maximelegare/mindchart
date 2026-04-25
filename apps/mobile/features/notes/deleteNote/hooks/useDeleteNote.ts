import { useControllers } from "@/api/controllers/useControllers";

export const useDeleteNote = () => {
  const { useDeleteNoteByIdMutation } = useControllers().notesAndThoughts;
  const { mutateAsync: deleteNoteByIdMutateAsync } =
    useDeleteNoteByIdMutation();

  const deleteNoteAction = async (noteId: string) => {
    await deleteNoteByIdMutateAsync({ noteId });
  };

  return {
    deleteNoteAction,
  };
};
