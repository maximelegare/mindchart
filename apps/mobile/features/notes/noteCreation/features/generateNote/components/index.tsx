import {
  CategorySchema,
  GenerateNoteResponseSchema,
  Note,
  Thought,
  Topic,
} from "@repo/zod-schemas/client";
import { useControllers } from "@/api/controllers/useControllers";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons/icon";
import { Keyboard, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useAISettingsPreferences } from "@/features/settings/context/ai";
import { Typography } from "@/components/ui/typography";
import { useModal } from "@/components/ui/modal/modal";
import { LoadingState } from "@/components/ui/modal/custom/loadingState/loadingState";
import { GenerateNotePreview } from "@/features/notes/notePreview/generateNotePreview";
import { CategoryKey } from "@repo/sqlite";
import { z } from "zod";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LAYOUT_SIZES } from "@/components/layout/constants";
import { Gradient } from "@/components/ui/gradient";
import { cn } from "@/lib/cn";
import { useColorScheme } from "@/lib/useColorScheme";

const BUTTON_KEYBOARD_GAP = 12;
const BUTTON_MARGIN = 16;
const BUTTON_HEIGHT = 48;
const BUTTON_ANIMATION_MS = 220;

const buttonTimingConfig = {
  duration: BUTTON_ANIMATION_MS,
  easing: Easing.out(Easing.cubic),
};

export const GENERATE_NOTE_BUTTON_HEIGHT = BUTTON_HEIGHT;
export const GENERATE_NOTE_BUTTON_MARGIN = BUTTON_MARGIN;

type GenerateNoteVariant = "floating" | "centered";

export const GenerateNote = ({
  fileURI,
  inputText,
  currentView,
  onSuccess,
  keyboardHeight = 0,
  variant = "floating",
}: {
  fileURI: string | null;
  inputText: string;
  currentView: "audio" | "input";
  onSuccess?: () => void;
  keyboardHeight?: number;
  variant?: GenerateNoteVariant;
}) => {
  const { notesAndThoughts, categories } = useControllers();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();

  const { aiProviders } = useAISettingsPreferences();
  const { openModal, setModalContent, closeModal } = useModal();

  const { useInsertNoteAndThoughtsMutation, useGenerateNoteMutation } =
    notesAndThoughts;

  const { useInsertEmbeddingsMutation, useGenerateLocalEmbeddingsMutation } =
    useControllers().embeddings;

  const { useInsertNewTopicMutation } = useControllers().topics;
  const { mutateAsync: insertNewTopicMutateAsync } =
    useInsertNewTopicMutation();

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

  const floatingBottomOffset =
    insets.bottom +
    LAYOUT_SIZES.TAB_BAR_HEIGHT +
    LAYOUT_SIZES.TAB_BAR_PADDING_COMPENSATION +
    16;

  const buttonBottom = useSharedValue(BUTTON_MARGIN);

  React.useEffect(() => {
    if (variant !== "floating") return;

    const targetBottom =
      keyboardHeight > 0
        ? Math.max(
            BUTTON_KEYBOARD_GAP,
            keyboardHeight - floatingBottomOffset + BUTTON_KEYBOARD_GAP
          )
        : BUTTON_MARGIN;

    buttonBottom.value = withTiming(targetBottom, buttonTimingConfig);
  }, [buttonBottom, floatingBottomOffset, keyboardHeight, variant]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    bottom: buttonBottom.value,
  }));

  const isInputValid =
    currentView === "audio" ? !!fileURI : inputText.trim().length > 0;
  const isDisabled = !isInputValid;

  const handleInsertContent = async (
    note: Note,
    thoughts: Thought[],
    newTopic: Topic | null
  ) => {
    const embeddings = await generateLocalEmbeddingsMutateAsync({ thoughts });

    if (newTopic) {
      await insertNewTopicMutateAsync({ data: newTopic });
    }
    await insertNoteAndThoughtsMutateAsync({ note, thoughts });
    await insertEmbeddingsMutateAsync({ data: embeddings });
    onSuccess?.();
    closeModal();
  };

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

      const parsedResponse = GenerateNoteResponseSchema.parse(response);
      const parsedCategories = z.array(CategorySchema).parse(categoriesData);

      const {
        responseObject: { note, thoughts, topic },
      } = parsedResponse;

      if (note && thoughts) {
        setModalContent({
          title: "AI Generated Note",
          customContent: () => (
            <GenerateNotePreview
              onAction={handleInsertContent}
              note={note}
              topic={topic}
              thoughts={thoughts}
              categories={parsedCategories}
            />
          ),
        });
      }
    } catch (error) {
      console.error(error);
      closeModal();
    }
  };

  if (variant === "centered") {
    return (
      <View className="items-center px-4 pb-4 pt-2">
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
    <Animated.View
      pointerEvents="box-none"
      className="absolute right-0 left-0 items-end pr-2"
      style={buttonAnimatedStyle}
    >
      <Button
        onPress={handleGenerateNote}
        disabled={isDisabled}
        className="border border-input bg-secondary flex-row items-center gap-2"
        cornerRadius="full"
        size="sm"
      >
        <Icon name="sparkles" color="card" />
        <Typography variant="h4">Generate Note</Typography>
      </Button>
    </Animated.View>
  );
};
