import { Category, Note, Thought, Topic } from "@repo/zod-schemas";
import React from "react";
import { ScrollView, TextInput, View } from "react-native";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Typography } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EditableField } from "@/components/ui/editableField";
import { Switch } from "@/components/ui/switch";
import { TopicSelector } from "@/features/notes/notePreview/topicSelector";
import { generateID } from "@/utils/genrateID";
import { ThoughtBulletItem } from "./thoughtBulletItem";

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
  thoughts: Array<{
    title: string;
    summary: string;
    semanticLabel: string;
    id: string;
    createdAt: string;
    noteId: string;
    categoryId: string;
    thoughtId: string;
  }>;
};

type ManualNoteFormProps = {
  noteId: string;
  defaultTopic: Topic;
  categories: Category[];
  onSubmit: (note: Note, thoughts: Thought[]) => void;
};

const createEmptyThought = (noteId: string) => {
  const thoughtId = generateID();
  return {
    title: "",
    summary: "",
    semanticLabel: "",
    id: thoughtId,
    createdAt: new Date().toISOString(),
    noteId,
    categoryId: "uncategorized",
    thoughtId,
  };
};

export const ManualNoteForm = ({
  noteId,
  defaultTopic,
  categories,
  onSubmit,
}: ManualNoteFormProps) => {
  const [showTitles, setShowTitles] = React.useState(false);

  const { control, handleSubmit } = useForm<ManualNoteFormData>({
    defaultValues: {
      title: "",
      summary: "",
      topic: {
        id: defaultTopic.id,
        name: defaultTopic.name,
        isNew: defaultTopic.isNew,
        embedding: defaultTopic.embedding,
        createdAt: defaultTopic.createdAt,
      },
      thoughts: [createEmptyThought(noteId)],
    },
  });

  const {
    fields,
    remove: thoughtsRemove,
    insert: thoughtsInsert,
  } = useFieldArray({
    control,
    name: "thoughts",
  });

  const fieldRefs = React.useRef<Record<string, TextInput | null>>({});
  const pendingFocusKeyRef = React.useRef<string | null>(null);

  const registerFieldRef = React.useCallback(
    (key: string, ref: TextInput | null) => {
      fieldRefs.current[key] = ref;
    },
    []
  );

  const getPrimaryFieldKey = React.useCallback(
    (index: number) =>
      showTitles ? `thought-${index}-title` : `thought-${index}-summary`,
    [showTitles]
  );

  const focusField = React.useCallback((key: string, delay = 0) => {
    setTimeout(() => fieldRefs.current[key]?.focus(), delay);
  }, []);

  const scheduleFocusAfterUpdate = React.useCallback((key: string) => {
    pendingFocusKeyRef.current = key;
  }, []);

  React.useLayoutEffect(() => {
    const key = pendingFocusKeyRef.current;
    if (!key) return;

    pendingFocusKeyRef.current = null;
    const input = fieldRefs.current[key];
    if (input) {
      input.focus();
      return;
    }

    const timeoutId = setTimeout(() => fieldRefs.current[key]?.focus(), 0);
    return () => clearTimeout(timeoutId);
  }, [fields]);

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

  const handleNewBullet = (index: number) => {
    const nextIndex = index + 1;

    if (nextIndex < fields.length) {
      focusField(getPrimaryFieldKey(nextIndex));
      return;
    }

    thoughtsInsert(nextIndex, createEmptyThought(noteId));
    scheduleFocusAfterUpdate(getPrimaryFieldKey(nextIndex));
  };

  const handleBackspaceAtStart = (index: number) => {
    if (fields.length <= 1) return;

    const focusIndex = Math.max(0, index - 1);
    const focusKey = getPrimaryFieldKey(focusIndex);

    fieldRefs.current[focusKey]?.focus();
    scheduleFocusAfterUpdate(focusKey);

    requestAnimationFrame(() => {
      thoughtsRemove(index);
    });
  };

  return (
    <View className="flex-1 flex-col gap-4 w-full">
      <View className="flex-col gap-2">
        <Label nativeID="topic">Topic</Label>
        <Controller
          control={control}
          name="topic"
          render={({ field: { onChange, value } }) => (
            <TopicSelector
              selectedTopic={{ ...value }}
              onSelect={(topic) => onChange({ ...topic })}
            />
          )}
        />
      </View>

      <Controller
        control={control}
        name="title"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <View className="flex-col gap-1 relative w-full">
            <Label nativeID="title">Title</Label>
            <View className="relative">
              <EditableField
                className="p-2 rounded-lg bg-card border border-input relative"
                onChange={onChange}
                value={value}
                id="manual-note-title"
                title="Title"
                fontSize="lg"
                placeholder="Enter a title"
              />
            </View>
          </View>
        )}
      />

      <View className="flex-col gap-1 flex-1">
        <View className="flex-row items-center justify-between">
          <Label nativeID="thoughts">Content</Label>
          <View className="flex-row items-center gap-2">
            <Typography className="text-muted-foreground text-sm">
              Titles
            </Typography>
            <Switch checked={showTitles} onCheckedChange={setShowTitles} />
          </View>
        </View>

        <View className="flex-1 rounded-lg bg-card border border-input px-3 py-4 overflow-visible">
          <ScrollView
            style={{ flex: 1, overflow: "visible" }}
            contentContainerStyle={{ overflow: "visible" }}
            nestedScrollEnabled
          >
            <View className="flex-col gap-3 pb-2 pt-2">
              {fields.map((field, index) => (
                <ThoughtBulletItem
                  key={field.id}
                  index={index}
                  control={control}
                  categories={categories}
                  showTitles={showTitles}
                  registerFieldRef={registerFieldRef}
                  onNewBullet={handleNewBullet}
                  onBackspaceAtStart={handleBackspaceAtStart}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <View className="items-center pb-2">
        <Button onPress={handleSubmit(handleFormSubmit)} style={{ width: 250 }}>
          <Typography>Save Note</Typography>
        </Button>
      </View>
    </View>
  );
};
