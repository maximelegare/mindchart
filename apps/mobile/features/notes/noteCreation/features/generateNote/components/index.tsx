import { useControllers } from "@/api/controllers/useControllers";
import { Icon } from "@/components/ui/icons/icon";
import { Keyboard, TouchableOpacity, View } from "react-native";
import { useAISettingsPreferences } from "@/features/settings/context/ai";
import { Typography } from "@/components/ui/typography";
import { useModal } from "@/components/ui/modal/modal";
import { LoadingState } from "@/components/ui/modal/custom/loadingState/loadingState";
import { CategoryKey } from "@repo/sqlite";
import React from "react";
import { Gradient } from "@/components/ui/gradient";
import { cn } from "@/lib/cn";
import { useColorScheme } from "@/lib/useColorScheme";
import { useSaveGeneratedNote } from "@/features/notes/noteCreation/features/generateNote/hooks/useSaveGeneratedNote";
import { useNoteCreationStore } from "@/features/notes/noteCreation/context/noteCreationContext";
import { router } from "expo-router";

const SIZE_STYLES = {
  sm: { height: 36, paddingHorizontal: 12, icon: 14, gap: 6 },
  md: { height: 48, paddingHorizontal: 20, icon: 18, gap: 8 },
} as const;

export const GenerateNote = ({
  fileURI,
  inputText,
  currentView,
  onSuccess,
  size = "sm",
}: {
  fileURI: string | null;
  inputText: string;
  currentView: "audio" | "input";
  onSuccess?: () => void;
  size?: "sm" | "md";
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

  const isInputValid =
    currentView === "audio" ? !!fileURI : inputText.trim().length > 0;
  const isDisabled = !isInputValid;

  const handleGenerateNote = async () => {
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

      // Folder is chosen later on the note preview screen.
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

  const dimensions = SIZE_STYLES[size];

  return (
    <TouchableOpacity
      onPress={handleGenerateNote}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel="Generate note"
      activeOpacity={0.85}
      className={cn(
        "overflow-hidden rounded-full border border-border",
        isDisabled && "opacity-50"
      )}
      style={{
        height: dimensions.height,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {!isDisabled && (
        <Gradient theme={colorScheme} variant="primary" className="absolute" />
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: dimensions.gap,
          paddingHorizontal: dimensions.paddingHorizontal,
        }}
      >
        <Icon
          name="sparkles"
          size={dimensions.icon}
          color={isDisabled ? "border" : "background"}
        />
        <Typography
          className={cn(
            isDisabled ? "text-border" : "text-background",
            "font-bold text-center",
            size === "md" ? "text-base" : "text-sm"
          )}
        >
          Generate Note
        </Typography>
      </View>
    </TouchableOpacity>
  );
};
