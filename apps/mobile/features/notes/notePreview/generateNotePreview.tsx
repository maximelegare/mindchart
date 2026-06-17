import { Category, Note, Thought } from "@repo/zod-schemas";
import React from "react";
import { ScrollView, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { Typography } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EditableField } from "@/components/ui/editableField";
import { useModal } from "@/components/ui/modal/modal";
import { Icon } from "@/components/ui/icons/icon";
import { CategorySelector } from "./categoriesSelector";
import { LoadingState } from "@/components/ui/modal/custom/loadingState/loadingState";
import { Topic } from "@repo/zod-schemas/src/schemas";
import { TopicSelector } from "./topicSelector";
import { generateID } from "@/utils/genrateID";

type GenerateNotePreviewProps = {
  note: Note;
  thoughts: Thought[];
  categories: Category[];
  topic: Topic;
  onAction: (note: Note, thoughts: Thought[], topic: Topic | null) => void;
};

export const GenerateNotePreview = ({
  note,
  thoughts,
  categories,
  topic,
  onAction,
}: GenerateNotePreviewProps) => {
  const { closeModal, setModalContent } = useModal();

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
      })),
    },
  });

  // 1. Initialize useFieldArray
  const {
    fields,
    remove: thoughtsRemove,
    append: thoughtsAppend,
  } = useFieldArray({
    control,
    name: "thoughts",
  });

  const onSubmit = async (data: FormData) => {
    const { title, summary } = data;
    try {
      setModalContent({
        title: "Saving your Note",
        customContent: () => <LoadingState title="Saving..." size="large" />,
      });

      const noteData: Note = {
        id: note.id,
        title: title,
        summary: summary,
        rawText: note.rawText,
        topicId: topic.id,
        createdAt: note.createdAt ?? new Date().toISOString(),
      };

      // Call the onGeneratedNote callback to handle the note and thoughts
      // This is to be able to use useLlamaEmbeddings without being blocked by the modal

      onAction({ ...noteData }, data.thoughts, topic.isNew ? topic : null);
    } catch (error) {
      console.error("Error inserting note and thoughts:", error);
      setModalContent({
        title: "Error",
        description: "Error inserting note and thoughts",
      });
    }
  };

  const handleDeleteThought = (index: number) => {
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
    });
  };

  return (
    <View className="flex-col gap-4 w-full">
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
              />
            </View>
          </View>
        )}
      />

      <View className="flex-col gap-1">
        <Label nativeID="thoughts">Thoughts</Label>
        <ScrollView style={{ maxHeight: 400 }}>
          <View className="flex-col gap-4">
            {/* 2. Map over 'fields' instead of Controller 'value' */}
            {fields.map((field, index) => (
              <View
                key={field.id}
                /* CRITICAL: We decrease the zIndex as the index increases.
                   This ensures the top items float ABOVE the bottom items.
                */
                style={{ zIndex: fields.length - index }}
                className="flex-col gap-1 p-2 rounded-lg bg-card border border-input relative"
              >
                <Icon
                  name="pencil"
                  color="text"
                  size={15}
                  style={{ position: "absolute", top: 5, right: 5 }}
                />
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
        <Button variant="destructive" onPress={closeModal}>
          <Typography>Cancel</Typography>
        </Button>
        <Button onPress={handleSubmit(onSubmit)}>
          <Typography>Save</Typography>
        </Button>
      </View>
    </View>
  );
};
