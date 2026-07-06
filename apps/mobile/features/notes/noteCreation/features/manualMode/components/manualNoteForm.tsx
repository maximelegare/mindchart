import { Category, Note, Thought, Topic } from "@repo/zod-schemas";
import React from "react";
import { ScrollView, View } from "react-native";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Typography } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EditableField } from "@/components/ui/editableField";
import { Icon } from "@/components/ui/icons/icon";
import { CategorySelector } from "@/features/notes/notePreview/categoriesSelector";
import { TopicSelector } from "@/features/notes/notePreview/topicSelector";
import { generateID } from "@/utils/genrateID";

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
    append: thoughtsAppend,
  } = useFieldArray({
    control,
    name: "thoughts",
  });

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

  const handleDeleteThought = (index: number) => {
    if (fields.length === 1) return;
    thoughtsRemove(index);
  };

  const handleAddThought = () => {
    thoughtsAppend(createEmptyThought(noteId));
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
              <Icon
                name="pencil"
                color="text"
                size={15}
                style={{ position: "absolute", top: 5, right: 5, zIndex: 10 }}
              />
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
        <Label nativeID="thoughts">Thoughts</Label>
        <ScrollView style={{ flex: 1 }} nestedScrollEnabled>
          <View className="flex-col gap-4 pb-2">
            {fields.map((field, index) => (
              <View
                key={field.id}
                style={{ zIndex: fields.length - index }}
                className="flex-col gap-1 p-2 rounded-lg bg-card border border-input relative"
              >
                <Icon
                  name="pencil"
                  color="text"
                  size={15}
                  style={{ position: "absolute", top: 5, right: 5 }}
                />
                {fields.length > 1 && (
                  <Button
                    onPress={() => handleDeleteThought(index)}
                    variant="ghost"
                    style={{
                      position: "absolute",
                      zIndex: 100,
                      top: 30,
                      right: -13,
                    }}
                  >
                    <Icon
                      name="trash-2"
                      size={20}
                      color="destructive-foreground"
                    />
                  </Button>
                )}
                <Controller
                  control={control}
                  name={`thoughts.${index}.categoryId`}
                  render={({ field: { onChange, value } }) => {
                    const selectedCategory =
                      categories.find((cat) => cat.id === value) || null;
                    return (
                      <CategorySelector
                        selectedCategory={selectedCategory}
                        categories={categories}
                        onSelect={(category) => onChange(category.id)}
                      />
                    );
                  }}
                />
                <Controller
                  control={control}
                  name={`thoughts.${index}.title`}
                  render={({ field: { onChange, value } }) => (
                    <EditableField
                      style={{ marginTop: 30 }}
                      onChange={onChange}
                      value={value}
                      id={`manual-thought-title-${index}`}
                      title="Title"
                      fontSize="md"
                      placeholder="Enter a title"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name={`thoughts.${index}.summary`}
                  render={({ field: { onChange, value } }) => (
                    <EditableField
                      onChange={onChange}
                      value={value}
                      id={`manual-thought-summary-${index}`}
                      title="Summary"
                      fontSize="sm"
                      fontFamily="QuicksandRegular"
                      placeholder="Enter a bullet point"
                    />
                  )}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className="flex-row gap-2 justify-center border-b border-input pb-4">
        <Button
          className="flex-row gap-2 items-center"
          onPress={handleAddThought}
          variant="default"
          size="sm"
          cornerRadius="full"
        >
          <Icon name="plus" size={20} color="background" />
          <Typography>Add Thought</Typography>
        </Button>
      </View>

      <View className="items-center pb-2">
        <Button onPress={handleSubmit(handleFormSubmit)} style={{ width: 250 }}>
          <Typography>Save Note</Typography>
        </Button>
      </View>
    </View>
  );
};
