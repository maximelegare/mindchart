import { Category, Note, Thought } from "@repo/zod-schemas";
import React, { useEffect, useState } from "react";
import { Keyboard, ScrollView, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { Typography } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EditableField } from "@/components/ui/editableField";
import { Icon } from "@/components/ui/icons/icon";
import { CategorySelector } from "../../shared/ui/categoriesSelector";
import { Topic } from "@repo/zod-schemas/src/schemas";
import { TopicSelector } from "../../shared/ui/topicSelector";
import { generateID } from "@/utils/genrateID";

type EditNotePreviewProps = {
  note: Note;
  thoughts: Thought[];
  categories: Category[];
  topic: Topic;
  onAction: (
    note: Note,
    thoughts: (Thought & { status: "new" | "updated" })[],
    thoughtsToDelete: string[]
  ) => void;
  onCancel: () => void;
};

export const EditNotePreview = ({
  note,
  thoughts,
  categories,
  topic,
  onAction,
  onCancel,
}: EditNotePreviewProps) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  // Keyboard handling
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardHeight(0)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  type FormData = {
    title: string;
    summary: string;
    thoughts: Array<{
      title: string;
      summary: string;
      semanticLabel: string;
      topic: string;
      id: string;
      createdAt: string;
      noteId: string;
      categoryId: string;
      thoughtId: string;
      status: "new" | "updated";
    }>;
    topic: {
      id: string;
      name: string;
      isNew?: boolean;
      embedding: Float32Array;
      createdAt: string;
    };
  };

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      title: note.title,
      summary: note.summary,
      topic: {
        id: topic.id,
        name: topic?.name,
        isNew: topic.isNew,
        embedding: topic.embedding,
        createdAt: topic.createdAt,
      },
      thoughts: thoughts.map((thought) => ({
        title: thought.title ?? "",
        summary: thought.summary ?? "",
        semanticLabel: thought.semanticLabel,
        id: thought.id,
        createdAt: thought.createdAt ?? "",
        noteId: thought.noteId,
        categoryId: thought.categoryId,
        thoughtId: thought.thoughtId,
        status: "updated",
      })),
    },
  });

  const [defaultThoughts] = useState(thoughts.map((thought) => thought.id));
  const [thoughtsToDelete, setThoughtsToDelete] = useState<string[]>([]);

  // 1. Initialize useFieldArray
  const {
    fields: thoughtsFields,
    remove: thoughtsRemove,
    append: thoughtsAppend,
  } = useFieldArray({
    control,
    name: "thoughts",
  });

  const onSubmit = async (data: FormData) => {
    const { title, summary } = data;
    try {
      const noteData = {
        id: note.id,
        title: title,
        summary: summary,
        rawText: note.rawText,
        topicId: data.topic.id,
      };

      const thoughtsData = data.thoughts.map((thought) => ({
        ...thought,
        semanticLabel: thought.semanticLabel ?? thought.title,
      }));
      // Call the onGeneratedNote callback to handle the note and thoughts
      // This is to be able to use useLlamaEmbeddings without being blocked by the modal

      onAction({ ...noteData }, thoughtsData, thoughtsToDelete);
    } catch (error) {
      console.error("Error inserting note and thoughts:", error);
    }
  };

  const handleDeleteThought = (index: number, thoughtId: string) => {
    if (defaultThoughts.includes(thoughtId)) {
      setThoughtsToDelete((prev) =>
        prev.includes(thoughtId) ? prev : [...prev, thoughtId]
      );
    }
    thoughtsRemove(index);
  };

  const handleAddThought = () => {
    const thoughtId = generateID();
    thoughtsAppend({
      title: "",
      summary: "",
      semanticLabel: "",
      topic: topic.id,
      id: thoughtId,
      createdAt: new Date().toISOString(),
      noteId: note.id,
      categoryId: "uncategorized",
      thoughtId: thoughtId,
      status: "new",
    });
  };

  return (
    <View
      className="flex-col gap-4 w-full"
      style={{ paddingBottom: keyboardHeight !== 0 ? keyboardHeight : 0 }}
    >
      <View className="flex-col gap-1">
        <View className="flex-col gap-2">
          <Label nativeID="title">Topic</Label>
          <Controller
            control={control}
            name="topic"
            render={({ field: { onChange, value } }) => {
              return (
                <TopicSelector
                  selectedTopic={{ ...value }}
                  onSelect={(t) => onChange({ ...t })}
                />
              );
            }}
          />
        </View>
      </View>

      {note.rawText ? (
        <View className="flex-col gap-1">
          <Label nativeID="rawText">Original text</Label>
          <Typography
            variant="p"
            className="p-2 rounded-lg bg-card border border-input"
          >
            {note.rawText}
          </Typography>
        </View>
      ) : null}

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
                id="title"
                title="Title"
                fontSize="lg"
                inBottomSheet
              />
            </View>
          </View>
        )}
      />

      <View className="flex-col gap-1">
        <Label nativeID="thoughts">Thoughts</Label>
        <ScrollView style={{ maxHeight: keyboardHeight !== 0 ? 150 : 300 }}>
          <View className="flex-col gap-4">
            {/* 2. Map over 'fields' instead of Controller 'value' */}
            {thoughtsFields.map((field, index) => (
              <View
                key={field.id}
                /* CRITICAL: We decrease the zIndex as the index increases.
                   This ensures the top items float ABOVE the bottom items.
                */
                style={{ zIndex: thoughtsFields.length - index }}
                className="flex-col gap-1 p-2 rounded-lg bg-card border border-input relative"
              >
                <Icon
                  name="pencil"
                  color="text"
                  size={15}
                  style={{ position: "absolute", top: 5, right: 5 }}
                />
                <Button
                  onPress={() => handleDeleteThought(index, field.thoughtId)}
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
                      id={`title-${index}`}
                      title="Title"
                      fontSize="md"
                      inBottomSheet
                      className="relative"
                      placeholder="Enter a Title"
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
                      id={`summary-${index}`}
                      title="Summary"
                      fontSize="sm"
                      fontFamily="QuicksandRegular"
                      inBottomSheet
                      placeholder="Enter a Bullet Point"
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
          onPress={() => handleAddThought()}
          variant="default"
          size="sm"
          cornerRadius="full"
        >
          <Icon name="plus" size={20} color="background" />
          <Typography>Add Thought</Typography>
        </Button>
      </View>

      <View className="flex-row gap-2 justify-center">
        <Button variant="destructive" onPress={onCancel}>
          <Typography>Cancel</Typography>
        </Button>
        <Button onPress={handleSubmit(onSubmit)}>
          <Typography>Save</Typography>
        </Button>
      </View>
    </View>
  );
};
