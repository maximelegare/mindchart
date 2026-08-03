import { useControllers } from "@/api/controllers/useControllers";
import { Keyboard } from "react-native";
import { useAISettingsPreferences } from "@/features/settings/context/ai";
import { useModal } from "@/components/ui/modal/modal";
import { LoadingState } from "@/components/ui/modal/custom/loadingState/loadingState";
import { CategoryKey } from "@repo/sqlite";
import { useSaveGeneratedNote } from "@/features/notes/noteCreation/features/generateNote/hooks/useSaveGeneratedNote";
import { useNoteCreationStore } from "@/features/notes/noteCreation/context/noteCreationContext";
import { router } from "expo-router";

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
  const { notesAndThoughts, categories } = useControllers();
  const { aiProviders } = useAISettingsPreferences();
  const { openModal, closeModal, setModalContent } = useModal();
  const { saveGeneratedNote } = useSaveGeneratedNote();
  const requestFabClose = useNoteCreationStore(
    (state) => state.requestFabClose
  );

  const { useGenerateNoteMutation } = notesAndThoughts;
  const { mutateAsync: generateNoteMutateAsync } = useGenerateNoteMutation();

  const { useFetchAllCategoriesQuery } = categories;
  const { data: categoriesData } = useFetchAllCategoriesQuery({
    enabled: !!fileURI || !!inputText,
  });

  const isInputValid =
    currentView === "audio" ? !!fileURI : inputText.trim().length > 0;
  const isDisabled = !isInputValid;

  const generateNote = async () => {
    if (isDisabled) return;

    Keyboard.dismiss();

    openModal({
      dismissOnBackgroundPress: false,
      customContent: () => (
        <LoadingState title="Generating Your Note" size="large" />
      ),
    });

    try {
      const categoryNames = categoriesData?.map((c) => c.id) as CategoryKey[];
      let response;

      if (currentView === "audio") {
        response = await generateNoteMutateAsync({
          data: {
            text: undefined,
            audio: { uri: fileURI!, name: "audio.m4a", type: "audio/m4a" },
            categories: categoryNames.join(","),
          },
          options: { providers: aiProviders },
        });
      } else {
        response = await generateNoteMutateAsync({
          data: {
            text: inputText,
            audio: undefined,
            categories: categoryNames.join(","),
          },
          options: { providers: aiProviders },
        });
      }

      if (!response.success || !response.responseObject) {
        closeModal();
        return;
      }

      const { note, thoughts, topic } = response.responseObject;

      if (!note || !thoughts?.length || !topic) {
        closeModal();
        return;
      }

      setModalContent({
        customContent: () => (
          <LoadingState title="Saving Your Note" size="large" />
        ),
      });

      const noteId = await saveGeneratedNote({
        note,
        thoughts,
        topic,
        folderId: null,
      });

      closeModal();
      onSuccess?.();
      requestFabClose();
      router.push({
        pathname: "/notes/[id]",
        params: { id: noteId, mode: "preview" },
      });
    } catch (error) {
      console.error(error);
      closeModal();
    }
  };

  return { generateNote, isDisabled };
};
