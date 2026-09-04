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
import { generateID } from "@/utils/genrateID";

type EditNotePreviewProps = {
  note: Note;
  thoughts: Thought[];
  categories: Category[];
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
  onAction,
  onCancel,
}: EditNotePreviewProps) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
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
      id: string;
      createdAt: string;
      noteId: string;
      categoryId: string;
      thoughtId: string;
      isCompletable: boolean;
      isCompleted: boolean;
      status: "new" | "updated";
    }>;
  };

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      title: note.title,
      summary: note.summary,
      thoughts: thoughts.map((thought) => ({
        title: thought.title ?? "",
        summary: thought.summary ?? "",
        semanticLabel: thought.semanticLabel,
        id: thought.id,
        createdAt: thought.createdAt ?? "",
        noteId: thought.noteId,
        categoryId: thought.categoryId,
        thoughtId: thought.thoughtId,
        isCompletable: thought.isCompletable ?? false,
        isCompleted: thought.isCompleted ?? false,
        status: "updated",
      })),
    },
  });

  const [defaultThoughts] = useState(thoughts.map((thought) => thought.id));
  const [thoughtsToDelete, setThoughtsToDelete] = useState<string[]>([]);

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
      };

      const thoughtsData = data.thoughts.map((thought) => ({
        ...thought,
        semanticLabel: thought.semanticLabel ?? thought.title,
      }));

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
      id: thoughtId,
      createdAt: new Date().toISOString(),
      noteId: note.id,
      categoryId: "uncategorized",
      thoughtId: thoughtId,
      isCompletable: false,
      isCompleted: false,
      status: "new",
    });
  };

  return (
    <View
      className="flex-col gap-4 w-full"
      style={{ paddingBottom: keyboardHeight !== 0 ? keyboardHeight : 0 }}
    >
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
            {thoughtsFields.map((field, index) => (
              <View
                key={field.id}
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
