import { Category, Note, Thought, Topic } from "@repo/zod-schemas";
import React from "react";
import { ScrollView, View } from "react-native";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { Typography } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EditableField } from "@/components/ui/editableField";
import {
  ThoughtsEditor,
  createEmptyThought,
  type ThoughtsFormValue,
} from "@/components/ui/thoughtsEditor";
import { TopicSelector } from "@/features/notes/notePreview/topicSelector";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LAYOUT_SIZES } from "@/components/layout/constants";

type ManualNoteFormData = {
  title: string;
  summary: string;
  topic: {
    id: string;
    name: string;
    isNew?: boolean;
    embedding: Float32Array;
    createdAt?: string;
  };
  thoughts: ThoughtsFormValue[];
};

type ManualNoteFormDefaultValues = {
  title?: string;
  summary?: string;
  topic?: Topic;
  thoughts?: Thought[];
};

type ManualNoteFormProps = {
  noteId: string;
  defaultTopic: Topic;
  categories: Category[];
  onSubmit: (note: Note, thoughts: Thought[]) => void;
  defaultValues?: ManualNoteFormDefaultValues;
};

const mapThoughtToFormValue = (thought: Thought, noteId: string) => ({
  title: thought.title ?? "",
  summary: thought.summary ?? "",
  semanticLabel: thought.semanticLabel ?? "",
  id: thought.id,
  createdAt: thought.createdAt ?? new Date().toISOString(),
  noteId: thought.noteId ?? noteId,
  categoryId: thought.categoryId ?? "uncategorized",
  thoughtId: thought.thoughtId ?? thought.id,
});

const buildFormDefaultValues = (
  noteId: string,
  defaultTopic: Topic,
  defaultValues?: ManualNoteFormDefaultValues
): ManualNoteFormData => {
  const topic = defaultValues?.topic ?? defaultTopic;

  return {
    title: defaultValues?.title ?? "",
    summary: defaultValues?.summary ?? "",
    topic: {
      id: topic.id,
      name: topic.name,
      isNew: topic.isNew,
      embedding: topic.embedding,
      createdAt: topic.createdAt,
    },
    thoughts: defaultValues?.thoughts?.length
      ? defaultValues.thoughts.map((thought) =>
          mapThoughtToFormValue(thought, noteId)
        )
      : [createEmptyThought(noteId)],
  };
};

const TITLE_SCROLL_PADDING = 12;
const FIELD_CHIP_HEIGHT = 40;

export const ManualNoteForm = ({
  noteId,
  defaultTopic,
  categories,
  onSubmit,
  defaultValues,
}: ManualNoteFormProps) => {
  const insets = useSafeAreaInsets();
  const tabBarOffset =
    LAYOUT_SIZES.TAB_BAR_HEIGHT +
    LAYOUT_SIZES.TAB_BAR_PADDING_COMPENSATION +
    insets.bottom;

  const [titleContainerWidth, setTitleContainerWidth] = React.useState(0);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  const form = useForm<ManualNoteFormData>({
    defaultValues: buildFormDefaultValues(noteId, defaultTopic, defaultValues),
  });
  const { control, handleSubmit } = form;

  const handleFormSubmit = (data: ManualNoteFormData) => {
    const thoughts: Thought[] = data.thoughts
      .filter(
        (thought) =>
          thought.title.trim() ||
          thought.summary.trim() ||
          thought.semanticLabel.trim()
      )
      .map((thought) => ({
        ...thought,
        title: thought.title.trim(),
        summary: thought.summary.trim(),
        semanticLabel:
          thought.semanticLabel.trim() ||
          thought.title.trim() ||
          thought.summary.trim(),
        createdAt: thought.createdAt,
      }));

    if (thoughts.length === 0) return;

    const note: Note = {
      id: noteId,
      title: data.title.trim(),
      summary: data.summary.trim(),
      rawText: "",
      topicId: data.topic.id,
      createdAt: new Date().toISOString(),
    };

    onSubmit(note, thoughts);
  };

  return (
    <FormProvider {...form}>
      <View className="flex-1 flex-col gap-2 w-full min-h-0">
        <View className="flex-row gap-3 items-start w-full shrink-0">
          <View className="flex-1 min-w-0 flex-col">
            <Label className="text-popover-foreground" nativeID="title">
              Title
            </Label>
            <Controller
              control={control}
              name="title"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <View
                  className="rounded-lg bg-card border border-input overflow-hidden justify-center"
                  style={{ minHeight: FIELD_CHIP_HEIGHT }}
                  onLayout={(event) =>
                    setTitleContainerWidth(event.nativeEvent.layout.width)
                  }
                >
                  <ScrollView
                    horizontal
                    nestedScrollEnabled
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                      paddingHorizontal: TITLE_SCROLL_PADDING,
                      alignItems: "center",
                      minHeight: FIELD_CHIP_HEIGHT,
                    }}
                  >
                    <EditableField
                      className="p-0 m-0 bg-transparent border-0"
                      style={{
                        minWidth: Math.max(
                          titleContainerWidth - TITLE_SCROLL_PADDING * 2,
                          Math.max(value.length, 12) * 9 + 8
                        ),
                        minHeight: 24,
                        paddingVertical: 0,
                        textAlignVertical: "center",
                      }}
                      onChange={onChange}
                      value={value}
                      id="manual-note-title"
                      title="Title"
                      fontSize="md"
                      placeholder="Enter a title"
                      multiline={false}
                    />
                  </ScrollView>
                </View>
              )}
            />
          </View>

          <View className="shrink-0 flex-col">
            <Label className="text-popover-foreground" nativeID="topic">
              Topic
            </Label>
            <Controller
              control={control}
              name="topic"
              render={({ field: { onChange, value } }) => (
                <TopicSelector
                  selectedTopic={{ ...value }}
                  onSelect={(topic) => onChange({ ...topic })}
                  maxChars={18}
                />
              )}
            />
          </View>
        </View>

        <ThoughtsEditor
          noteId={noteId}
          categories={categories}
          defaultShowTitles={
            defaultValues?.thoughts?.some((thought) => thought.title?.trim()) ??
            false
          }
          onKeyboardHeightChange={setKeyboardHeight}
        />

        {keyboardHeight === 0 ? (
          <View
            className="items-center shrink-0"
            style={{ paddingBottom: tabBarOffset }}
          >
            <Button
              onPress={handleSubmit(handleFormSubmit)}
              style={{ width: 250 }}
            >
              <Typography>Save Note</Typography>
            </Button>
          </View>
        ) : null}
      </View>
    </FormProvider>
  );
};
