import { useCallback } from "react";
import { router } from "expo-router";
import {
  createBlankDraftNote,
  useNoteDraftStore,
} from "@/features/notes/noteDraft/store/noteDraftStore";
import { useOptionsBar } from "@/features/contentList/components/optionsBar/context/optionBarContext";

export const useCreateBlankNote = () => {
  const currentFolderId = useOptionsBar((s) => s.currentFolderId);
  const setDraft = useNoteDraftStore((s) => s.setDraft);

  const createBlankNote = useCallback(
    (folderIdOverride?: string | null) => {
      const folderId =
        folderIdOverride !== undefined ? folderIdOverride : currentFolderId;
      const draft = createBlankDraftNote(folderId);
      setDraft(draft);

      router.push({
        pathname: "/notes/[id]",
        params: { id: draft.id, mode: "new" },
      });
    },
    [currentFolderId, setDraft]
  );

  return { createBlankNote };
};
