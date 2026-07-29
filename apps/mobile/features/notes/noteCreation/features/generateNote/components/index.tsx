import { useControllers } from "@/api/controllers/useControllers";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons/icon";
import { Keyboard, View, Alert } from "react-native";
import { useAISettingsPreferences } from "@/features/settings/context/ai";
import { Typography } from "@/components/ui/typography";
import { useModal } from "@/components/ui/modal/modal";
import { LoadingState } from "@/components/ui/modal/custom/loadingState/loadingState";
import { CategoryKey } from "@repo/sqlite";
import React from "react";
import { Gradient } from "@/components/ui/gradient";
import { cn } from "@/lib/cn";
import { useColorScheme } from "@/lib/useColorScheme";
import {
  KEYBOARD_ACTION_FOOTER_PADDING_Y,
  KeyboardActionFooter,
} from "@/features/notes/noteCreation/features/floatingButton/components/footer/keyboardActionFooter";
import { useSaveGeneratedNote } from "@/features/notes/noteCreation/features/generateNote/hooks/useSaveGeneratedNote";
import { useNoteCreationStore } from "@/features/notes/noteCreation/context/noteCreationContext";
import { router } from "expo-router";
import {
  FolderSelector,
  type FolderSelection,
} from "@/features/notes/notePreview/folderSelector";

const BUTTON_HEIGHT = 48;

export const GENERATE_NOTE_BUTTON_HEIGHT = BUTTON_HEIGHT;
export const GENERATE_NOTE_BUTTON_MARGIN = KEYBOARD_ACTION_FOOTER_PADDING_Y;

type GenerateNoteVariant = "floating" | "centered";

export const GenerateNote = ({
  fileURI,
  inputText,
  currentView,
  onSuccess,
  variant = "floating",
}: {
  fileURI: string | null;
  inputText: string;
  currentView: "audio" | "input";
  onSuccess?: () => void;
  variant?: GenerateNoteVariant;
}) => {
  const { notesAndThoughts, categories } = useControllers();
  const { colorScheme } = useColorScheme();
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

  const [selectedFolder, setSelectedFolder] =
    React.useState<FolderSelection>(null);

  const isInputValid =
    currentView === "audio" ? !!fileURI : inputText.trim().length > 0;
  const isDisabled = !isInputValid;

  const handleGenerateNote = async () => {
    if (isDisabled) return;

    if (!selectedFolder) {
      Alert.alert(
        "Folder required",
        "Please select a folder before generating a note. Root is not allowed."
      );
      return;
    }

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
        folderId: selectedFolder?.id ?? null,
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

  if (variant === "centered") {
    return (
      <View className="items-center gap-3 px-4 pb-4 pt-2">
        <FolderSelector
          selectedFolder={selectedFolder}
          onSelect={setSelectedFolder}
          maxChars={22}
          allowRoot={false}
        />
        <Button
          variant="outline"
          size="lg"
          onPress={handleGenerateNote}
          disabled={isDisabled}
          className="relative overflow-hidden rounded-full border-border"
          style={{ width: 250 }}
        >
          <Gradient
            theme={colorScheme}
            variant={isDisabled ? "none" : "primary"}
            className="absolute"
            style={{ width: 400 }}
          />

          <View className="flex-row justify-between items-center gap-2">
            <Icon
              name="sparkles"
              color={isDisabled ? "border" : "background"}
            />
            <Typography
              className={cn(
                isDisabled ? "text-border" : "text-background",
                "font-bold text-center"
              )}
            >
              Generate Note
            </Typography>
            <Icon
              name="sparkles"
              color={isDisabled ? "border" : "background"}
            />
          </View>
        </Button>
      </View>
    );
  }

  return (
    <KeyboardActionFooter>
      <View className="flex-row items-center gap-3">
        <FolderSelector
          selectedFolder={selectedFolder}
          onSelect={setSelectedFolder}
          maxChars={14}
          allowRoot={false}
        />
        <Button
          onPress={handleGenerateNote}
          disabled={isDisabled}
          variant="secondary"
          size="default"
          cornerRadius="full"
          className="flex-row items-center gap-2 px-6"
        >
          <Icon name="sparkles" color="card" />
          <Typography variant="h4">Generate Note</Typography>
        </Button>
      </View>
    </KeyboardActionFooter>
  );
};
