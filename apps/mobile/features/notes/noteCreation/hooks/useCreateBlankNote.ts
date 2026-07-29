import { useCallback } from "react";
import { router } from "expo-router";
import { useControllers } from "@/api/controllers/useControllers";
import { createEmptyThought } from "@/components/ui/thoughtsEditor";
import { useOptionsBar } from "@/features/contentList/components/optionsBar/context/optionBarContext";
import { generateID } from "@/utils/genrateID";

export const useCreateBlankNote = () => {
  const currentFolderId = useOptionsBar((s) => s.currentFolderId);
  const { notesAndThoughts } = useControllers();
  const { mutateAsync: insertNoteAndThoughts } =
    notesAndThoughts.useInsertNoteAndThoughtsMutation();

  const createBlankNote = useCallback(async () => {
    const noteId = generateID();
    const thought = createEmptyThought(noteId);
    // Non-empty so local embedding helpers never see a blank label.
    thought.semanticLabel = " ";

    await insertNoteAndThoughts({
      note: {
        id: noteId,
        title: "",
        summary: "",
        rawText: "",
        folderId: currentFolderId,
        createdAt: new Date().toISOString(),
      },
      thoughts: [thought],
    });

    router.push({
      pathname: "/notes/[id]",
      params: { id: noteId, mode: "preview" },
    });
  }, [currentFolderId, insertNoteAndThoughts]);

  return { createBlankNote };
};
