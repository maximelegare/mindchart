import { useCallback } from "react";
import { router } from "expo-router";
import {
  createBlankDraftNote,
  useNoteDraftStore,
} from "@/features/notes/noteDraft/store/noteDraftStore";
import { useOptionsBar } from "@/features/contentList/components/optionsBar/context/optionBarContext";
import { useNoteCreationStore } from "@/features/notes/noteCreation/context/noteCreationContext";

export const useCreateBlankNote = () => {
  const currentFolderId = useOptionsBar((s) => s.currentFolderId);
  const setDraft = useNoteDraftStore((s) => s.setDraft);
  const requestFabClose = useNoteCreationStore((s) => s.requestFabClose);

  const createBlankNote = useCallback(
    (folderIdOverride?: string | null) => {
      const folderId =
        folderIdOverride !== undefined ? folderIdOverride : currentFolderId;
      const draft = createBlankDraftNote(folderId);
      setDraft(draft);
      requestFabClose();

      router.push({
        pathname: "/notes/[id]",
        params: { id: draft.id, mode: "new" },
      });
    },
    [currentFolderId, requestFabClose, setDraft]
  );

  return { createBlankNote };
};
