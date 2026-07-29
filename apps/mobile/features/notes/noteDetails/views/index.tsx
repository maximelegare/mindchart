import React from "react";
import { Keyboard, TextInput, View } from "react-native";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Typography } from "@/components/ui/typography";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";
import {
  ThoughtsEditor,
  createEmptyThought,
  type ThoughtsFormValue,
} from "@/components/ui/thoughtsEditor";
import { useControllers } from "@/api/controllers/useControllers";
import { useEditNote } from "@/features/notes/editNote/hooks/useEditNote";
import type { NoteEditorMode } from "@/features/notes/noteDetails/types";

type NoteDetailsFeatureProps = {
  isPending: boolean;
  note: ReturnType<typeof parseNoteAndThoughts>;
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
  saveActionRef?: React.MutableRefObject<(() => void) | null>;
  onSavingChange?: (saving: boolean) => void;
  simplified?: boolean;
  /** regular: opened from list/etc. preview: opened after AI generation. */
  editorMode?: NoteEditorMode;
};

type NoteRow = NonNullable<ReturnType<typeof parseNoteAndThoughts>>[number];

type NoteDetailsFormValues = {
  title: string;
  thoughts: ThoughtsFormValue[];
};

const mapThoughtToFormValue = (
  thought: {
    title?: string | null;
    summary?: string | null;
    semanticLabel?: string | null;
    id: string;
    createdAt?: string | null;
    noteId: string;
    categoryId: string;
    thoughtId: string;
  },
  noteId: string
): ThoughtsFormValue => ({
  title: thought.title ?? "",
  summary: thought.summary ?? "",
  semanticLabel: thought.semanticLabel ?? "",
  id: thought.id,
  createdAt: thought.createdAt ?? new Date().toISOString(),
  noteId: thought.noteId ?? noteId,
  categoryId: thought.categoryId ?? "uncategorized",
  thoughtId: thought.thoughtId ?? thought.id,
});

type NoteDetailsContentProps = {
  note: NoteRow;
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
  saveActionRef?: React.MutableRefObject<(() => void) | null>;
  onSavingChange?: (saving: boolean) => void;
  simplified: boolean;
};

function NoteDetailsContent({
  note,
  isEditing,
  onEditingChange,
  saveActionRef,
  onSavingChange,
  simplified,
}: NoteDetailsContentProps) {
  const { editNoteAction } = useEditNote();
  const { useFetchAllCategoriesQuery } = useControllers().categories;
  const { data: categoriesData } = useFetchAllCategoriesQuery();

  const originalThoughtIds = React.useMemo(
    () => new Set(note.thoughts.map((thought) => thought.id)),
    [note.thoughts]
  );

  const initialThoughts = React.useMemo(() => {
    if (!note.thoughts.length) return [createEmptyThought(note.id)];
    return note.thoughts.map((thought) =>
      mapThoughtToFormValue(thought, note.id)
    );
  }, [note.id, note.thoughts]);

  const form = useForm<NoteDetailsFormValues>({
    defaultValues: {
      title: note.title,
      thoughts: initialThoughts,
    },
  });
  const { control, handleSubmit, reset } = form;

  // Keep form in sync when leaving edit or when note data refreshes in view mode.
  React.useEffect(() => {
    if (isEditing) return;
    reset({
      title: note.title,
      thoughts: initialThoughts,
    });
  }, [initialThoughts, isEditing, note.title, reset]);

  const handleSave = handleSubmit(async (data) => {
    Keyboard.dismiss();
    onSavingChange?.(true);
    try {
      const nextThoughts = data.thoughts
        .filter(
          (thought) =>
            thought.title.trim() ||
            thought.summary.trim() ||
            thought.semanticLabel.trim()
        )
        .map((thought) => {
          const title = thought.title.trim();
          const summary = thought.summary.trim();
          const semanticLabel =
            thought.semanticLabel.trim() || title || summary;
          return {
            ...thought,
            title,
            summary,
            semanticLabel,
            status: (originalThoughtIds.has(thought.id) ? "updated" : "new") as
              | "new"
              | "updated",
          };
        });

      if (nextThoughts.length === 0) return;

      const remainingIds = new Set(nextThoughts.map((thought) => thought.id));
      const thoughtsToDelete = [...originalThoughtIds].filter(
        (id) => !remainingIds.has(id)
      );

      await editNoteAction(
        {
          id: note.id,
          title: data.title.trim(),
          summary: note.summary,
          rawText: note.rawText ?? "",
          topicId: note.topicId,
          folderId: note.folderId ?? null,
          createdAt: note.createdAt,
        },
        nextThoughts,
        thoughtsToDelete
      );
      onEditingChange(false);
    } finally {
      onSavingChange?.(false);
    }
  });

  React.useEffect(() => {
    if (!saveActionRef) return;
    saveActionRef.current = () => {
      void handleSave();
    };
    return () => {
      saveActionRef.current = null;
    };
  }, [handleSave, saveActionRef]);

  const showTitles = note.thoughts.some((thought) => thought.title?.trim());

  const [titleInputHeight, setTitleInputHeight] = React.useState(28);

  React.useEffect(() => {
    if (isEditing) {
      setTitleInputHeight(28);
    }
  }, [isEditing]);

  return (
    <FormProvider {...form}>
      <View
        style={{ marginTop: 10 }}
        className=" flex-col flex-1 min-h-0 w-full gap-4 px-1"
      >
        <View className="w-full shrink-0">
          {isEditing ? (
            <Controller
              control={control}
              name="title"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter a title"
                  multiline
                  scrollEnabled={false}
                  textAlignVertical="top"
                  blurOnSubmit={false}
                  nativeID="note-details-title"
                  className="w-full m-0 p-0 bg-transparent border-0 text-foreground"
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    fontFamily: "QuicksandBold",
                    fontSize: 22,
                    lineHeight: 28,
                    minHeight: Math.max(28, titleInputHeight),
                    height: Math.max(28, titleInputHeight),
                    padding: 0,
                    margin: 0,
                  }}
                  onContentSizeChange={(event) => {
                    const nextHeight = Math.ceil(
                      event.nativeEvent.contentSize.height
                    );
                    if (nextHeight > 0) {
                      setTitleInputHeight(nextHeight);
                    }
                  }}
                />
              )}
            />
          ) : (
            <Typography
              variant="h3"
              className="w-full text-2xl leading-7"
              style={{ flexShrink: 1 }}
            >
              {note.title}
            </Typography>
          )}
        </View>

        <View className="flex-1 min-h-0">
          <ThoughtsEditor
            key={note.id}
            noteId={note.id}
            categories={categoriesData ?? []}
            defaultShowTitles={showTitles}
            readOnly={!isEditing}
            showGraphButtons={!isEditing}
            plain
            simplified={simplified}
          />
        </View>
      </View>
    </FormProvider>
  );
}

export const NoteDetailsFeature = ({
  isPending,
  note,
  isEditing,
  onEditingChange,
  saveActionRef,
  onSavingChange,
  simplified = false,
  editorMode: _editorMode = "regular",
}: NoteDetailsFeatureProps) => {
  if (isPending) return null;
  const noteRow = note?.[0];
  if (!noteRow) return null;

  return (
    <NoteDetailsContent
      key={noteRow.id}
      note={noteRow}
      isEditing={isEditing}
      onEditingChange={onEditingChange}
      saveActionRef={saveActionRef}
      onSavingChange={onSavingChange}
      simplified={simplified}
    />
  );
};
