import {
  CategorySchema,
  GenerateNoteResponseSchema,
  Note,
  Thought,
} from "@repo/zod-schemas/client";
import { useControllers } from "@/api/controllers/useControllers";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons/icon";
import { View } from "react-native";
import { Gradient } from "@/components/ui/gradient";
import { cn } from "@/lib/cn";
import { useSettingsStore } from "@/features/settings/context/settings";
import { Typography } from "@/components/ui/typography";
import { useModal } from "@/components/ui/modal/modal";
import { LoadingState } from "@/components/ui/modal/custom/loadingState/loadingState";
import { GenerateNotePreview } from "@/features/noteCreation/features/notePreview/generateNotePreview";
import { CategoryKey } from "@repo/sqlite";
import { z } from "zod";
import { useColorScheme } from "@/lib/useColorScheme";

export const GenerateNote = ({
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
  const { aiProvider } = useSettingsStore();
  const { openModal, setModalContent, closeModal } = useModal();

  const { colorScheme } = useColorScheme();
  const { useInsertNoteAndThoughtsMutation, useGenerateNoteMutation } =
    notesAndThoughts;

  const { useInsertEmbeddingsMutation, useGenerateLocalEmbeddingsMutation } =
    useControllers().embeddings;

  // const { mutateAsync: generateLocalNoteMutateAsync } = useGenerateLocalNoteMutation();
  const { mutateAsync: generateNoteMutateAsync } = useGenerateNoteMutation();
  const { mutateAsync: generateLocalEmbeddingsMutateAsync } =
    useGenerateLocalEmbeddingsMutation();
  const { mutateAsync: insertEmbeddingsMutateAsync } =
    useInsertEmbeddingsMutation();
  const { mutateAsync: insertNoteAndThoughtsMutateAsync } =
    useInsertNoteAndThoughtsMutation();

  const { useFetchAllCategoriesQuery } = categories;
  const { data: categoriesData } = useFetchAllCategoriesQuery({
    enabled: !!fileURI || !!inputText,
  });

  // Logic: Only valid if audio has a URI OR text view has content
  const isInputValid =
    currentView === "audio" ? !!fileURI : inputText.trim().length > 0;
  const isDisabled = !isInputValid;

  const handleInsertNoteAndThoughts = async (
    note: Note,
    thoughts: Thought[]
  ) => {
    const embeddings = await generateLocalEmbeddingsMutateAsync({ thoughts });
    await insertEmbeddingsMutateAsync({ data: embeddings });
    await insertNoteAndThoughtsMutateAsync({ note, thoughts });
    onSuccess?.();
    closeModal();
  };

  const handleGenerateNote = async () => {
    // Extra safety guard
    if (isDisabled) return;

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
          options: { providers: { llm: aiProvider } },
        });
      } else {
        response = await generateNoteMutateAsync({
          data: {
            text: inputText,
            audio: undefined,
            categories: categoryNames.join(","),
          },
          options: { providers: { llm: "local" } },
        });
      }

      const parsedResponse = GenerateNoteResponseSchema.parse(response);
      const parsedCategories = z.array(CategorySchema).parse(categoriesData);

      const {
        responseObject: { note, thoughts },
      } = parsedResponse;

      if (note && thoughts) {
        setModalContent({
          title: "AI Generated Note",
          customContent: () => (
            <GenerateNotePreview
              onAction={handleInsertNoteAndThoughts}
              note={note}
              thoughts={thoughts}
              categories={parsedCategories}
            />
          ),
        });
      }
    } catch (error) {
      console.error(error);
      closeModal(); // Close loading state on error
    }
  };

  return (
    <Button
      variant="outline"
      size="lg"
      onPress={handleGenerateNote}
      disabled={isDisabled}
      className="relative overflow-hidden rounded-full border-border"
      style={{ width: 250 }}
    >
      {/* Only show the colorful gradient if the button is active */}
      <Gradient
        theme={colorScheme}
        variant={isDisabled ? "none" : "primary"}
        className="absolute"
        style={{ width: 400 }}
      />

      <View className="flex-row justify-between items-center gap-2">
        <Icon name="sparkles" color={isDisabled ? "border" : "background"} />
        <Typography
          className={cn(
            isDisabled ? "text-border" : "text-background",
            "font-bold text-center"
          )}
        >
          Generate Note
        </Typography>
        <Icon name="sparkles" color={isDisabled ? "border" : "background"} />
      </View>
    </Button>
  );
};
