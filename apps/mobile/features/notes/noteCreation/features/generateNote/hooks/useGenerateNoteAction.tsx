import { useControllers } from "@/api/controllers/useControllers";
import { Keyboard } from "react-native";
import { useAISettingsPreferences } from "@/features/settings/context/ai";
import { useModal } from "@/components/ui/modal/modal";
import { LoadingState } from "@/components/ui/modal/custom/loadingState/loadingState";
import { loadingModalGeneratingNoteTitle } from "@/components/ui/modal/data/loadingModalLabels";
import { useNoteCreationStore } from "@/features/notes/noteCreation/context/noteCreationContext";
import { router } from "expo-router";
import {
  createGeneratedDraftNote,
  useNoteDraftStore,
} from "@/features/notes/noteDraft/store/noteDraftStore";

export const useGenerateNoteAction = ({
  fileURI,
  inputText,
  currentView,
  onSuccess,
}: {
  fileURI: string | null;
  inputText: string;
  currentView: "audio" | "input";
  onSuccess?: () => void;
}) => {
  const { notesAndThoughts } = useControllers();
  const { aiProviders } = useAISettingsPreferences();
  const { openModal, closeModal } = useModal();
  const requestFabClose = useNoteCreationStore(
    (state) => state.requestFabClose
  );
  const setDraft = useNoteDraftStore((s) => s.setDraft);

  const { useGenerateNoteMutation } = notesAndThoughts;
  const { mutateAsync: generateNoteMutateAsync } = useGenerateNoteMutation();

  const isInputValid =
    currentView === "audio" ? !!fileURI : inputText.trim().length > 0;
  const isDisabled = !isInputValid;

  const generateNote = async () => {
    if (isDisabled) return;

    Keyboard.dismiss();

    openModal({
      dismissOnBackgroundPress: false,
      customContent: () => (
        <LoadingState title={loadingModalGeneratingNoteTitle()} size="large" />
      ),
    });

    try {
      let response;

      if (currentView === "audio") {
        response = await generateNoteMutateAsync({
          data: {
            text: undefined,
            audio: { uri: fileURI!, name: "audio.m4a", type: "audio/m4a" },
          },
          options: { providers: aiProviders },
        });
      } else {
        response = await generateNoteMutateAsync({
          data: {
            text: inputText,
            audio: undefined,
          },
          options: { providers: aiProviders },
        });
      }

      if (!response.success || !response.responseObject) {
        closeModal();
        return;
      }

      const { note, thoughts } = response.responseObject;

      if (!note || !thoughts?.length) {
        closeModal();
        return;
      }

      const draft = createGeneratedDraftNote(note, thoughts);
      setDraft(draft);

      closeModal();
      onSuccess?.();
      requestFabClose();
      router.push({
        pathname: "/notes/[id]",
        params: { id: draft.id, mode: "new" },
      });
    } catch (error) {
      console.error(error);
      closeModal();
    }
  };

  return { generateNote, isDisabled };
};
