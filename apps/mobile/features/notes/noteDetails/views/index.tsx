import React from "react";
import { Keyboard, TextInput, View } from "react-native";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Typography } from "@/components/ui/typography";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";
import {
  ThoughtsEditor,
  createEmptyThought,
  stripHtml,
  type ThoughtsEditorHandle,
  type ThoughtsFormValue,
} from "@/components/ui/thoughtsEditor";
import { useControllers } from "@/api/controllers/useControllers";
import { useEditNote } from "@/features/notes/editNote/hooks/useEditNote";
import { useSaveNewNote } from "@/features/notes/noteDraft/hooks/useSaveNewNote";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { gutter } from "@/components/ui/gutter";
import {
  noteDetailsTitleRequiredPlaceholder,
  NoteDetailsTitlePlaceholder,
} from "@/features/notes/noteDetails/noteDetailsLabels";
import { Person } from "@repo/zod-schemas";
import type { FeelingValue } from "@repo/zod-schemas/src/schemas";
import { useNoteDetailsViewStore } from "@/features/notes/noteDetails/context/noteDetailsViewContext";

type NoteDetailsFeatureProps = {
  isPending: boolean;
  note: ReturnType<typeof parseNoteAndThoughts>;
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
  saveActionRef?: React.MutableRefObject<(() => void) | null>;
  onSavingChange?: (saving: boolean) => void;
  /** Current folder from the header selector (preferred over stale note data). */
  folderId?: string | null;
  persons?: Person[];
  feeling?: FeelingValue | null;
  locationId?: string | null;
  locationName?: string | null;
  isNew?: boolean;
  /** Called when save validation needs to highlight the folder selector. */
  onFolderErrorChange?: (hasError: boolean) => void;
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
    isCompletable?: boolean;
    isCompleted?: boolean;
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
  isCompletable: thought.isCompletable ?? false,
  isCompleted: thought.isCompleted ?? false,
});

type NoteDetailsContentProps = {
  note: NoteRow;
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
  saveActionRef?: React.MutableRefObject<(() => void) | null>;
  onSavingChange?: (saving: boolean) => void;
  folderId: string | null;
  persons: Person[];
  feeling: FeelingValue | null;
  locationId: string | null;
  locationName: string | null;
  isNew: boolean;
  onFolderErrorChange?: (hasError: boolean) => void;
};

function NoteDetailsContent({
  note,
  isEditing,
  onEditingChange,
  saveActionRef,
  onSavingChange,
  folderId,
  persons,
  feeling,
  locationId,
  locationName,
  isNew,
  onFolderErrorChange,
}: NoteDetailsContentProps) {
  const { editNoteAction } = useEditNote();
  const { saveNewNote } = useSaveNewNote();
  const { useFetchAllCategoriesQuery } = useControllers().categories;
  const {
    useUpdateThoughtCompletionMutation,
    useUpdateThoughtCategoryMutation,
  } = useControllers().notesAndThoughts;
  const { mutate: persistThoughtCompletion } =
    useUpdateThoughtCompletionMutation();
  const { mutate: persistThoughtCategory } = useUpdateThoughtCategoryMutation();
  const simplified = useNoteDetailsViewStore((state) => state.simplified);
  const { data: categoriesData } = useFetchAllCategoriesQuery();
  const { colorScheme } = useColorScheme();
  const [titleRequiredError, setTitleRequiredError] = React.useState(false);
  // Remount TextInput when re-showing the error — Android/RN often won't
  // refresh placeholder text/color on an empty field otherwise.
  const [titleInputEpoch, setTitleInputEpoch] = React.useState(0);
  const requiredPlaceholderColor = hsl("foreground-errors", colorScheme);
  const thoughtsEditorRef = React.useRef<ThoughtsEditorHandle>(null);
  // Latest title from the input — RHF getValues can lag behind native TextInput.
  const titleDraftRef = React.useRef(note.title ?? "");
  const keepDraftOnExitRef = React.useRef(false);
  const wasEditingRef = React.useRef(isEditing);
  const [editorGeneration, setEditorGeneration] = React.useState(0);

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
  const { control, reset, getValues, setValue } = form;

  const restoreOriginalNote = React.useCallback(() => {
    titleDraftRef.current = note.title ?? "";
    setTitleRequiredError(false);
    reset({
      title: note.title,
      thoughts: initialThoughts,
    });
  }, [initialThoughts, note.title, reset]);

  // Discard must reset before the editor rebuilds HTML (child useEffect).
  React.useLayoutEffect(() => {
    const wasEditing = wasEditingRef.current;
    wasEditingRef.current = isEditing;
    if (isEditing || !wasEditing) return;
    if (keepDraftOnExitRef.current) return;
    restoreOriginalNote();
    setEditorGeneration((generation) => generation + 1);
  }, [isEditing, restoreOriginalNote]);

  // Keep form in sync when note data refreshes in view mode.
  React.useEffect(() => {
    if (isEditing) return;
    if (keepDraftOnExitRef.current) {
      keepDraftOnExitRef.current = false;
      return;
    }
    restoreOriginalNote();
  }, [isEditing, restoreOriginalNote]);

  // Entering edit: seed draft from current form/note so validation matches the field.
  React.useEffect(() => {
    if (!isEditing) return;
    const current = (getValues("title") ?? note.title ?? "").toString();
    titleDraftRef.current = current;
  }, [getValues, isEditing, note.title]);

  const saveNote = React.useCallback(async () => {
    const data = getValues();
    // Prefer the live TextInput draft over possibly stale form state.
    const title = (titleDraftRef.current ?? data.title ?? "").trim();
    setValue("title", title, { shouldDirty: true });

    let hasError = false;

    const titleMissing = !title;
    const folderMissing = !folderId;
    setTitleRequiredError(titleMissing);
    if (titleMissing) {
      setTitleInputEpoch((epoch) => epoch + 1);
    }
    onFolderErrorChange?.(folderMissing);
    if (titleMissing || folderMissing) {
      hasError = true;
    }

    const thoughtsValid =
      thoughtsEditorRef.current?.validateRequiredContent() ?? true;
    if (!thoughtsValid) {
      hasError = true;
    }

    if (hasError) {
      return;
    }

    Keyboard.dismiss();
    onSavingChange?.(true);
    try {
      // Drop fully empty bullets on save; keep only contentful thoughts.
      const nextThoughts = data.thoughts
        .filter(
          (thought) =>
            stripHtml(thought.title) ||
            stripHtml(thought.summary) ||
            thought.semanticLabel.trim()
        )
        .map((thought) => {
          const thoughtTitle = thought.title.trim();
          const summary = thought.summary.trim();
          const semanticLabel =
            stripHtml(thought.semanticLabel) ||
            stripHtml(thoughtTitle) ||
            stripHtml(summary);
          return {
            ...thought,
            title: thoughtTitle,
            summary,
            semanticLabel,
            status: (originalThoughtIds.has(thought.id) ? "updated" : "new") as
              | "new"
              | "updated",
          };
        });

      // If everything was empty bullets, surface editor validation instead of saving.
      if (nextThoughts.length === 0) {
        thoughtsEditorRef.current?.validateRequiredContent();
        return;
      }

      const noteToSave = {
        id: note.id,
        title,
        summary: note.summary,
        rawText: note.rawText ?? "",
        folderId: folderId ?? note.folderId ?? null,
        persons: isNew ? persons : (note.persons ?? []),
        feeling: isNew ? feeling : (note.feeling ?? null),
        locationId: isNew ? locationId : (note.locationId ?? null),
        locationName: isNew ? locationName : (note.locationName ?? null),
        createdAt: note.createdAt,
      };

      if (isNew) {
        const thoughtsToSave = nextThoughts.map(
          ({ status: _status, ...thought }) => ({
            ...thought,
            noteId: note.id,
          })
        ) as import("@repo/zod-schemas").Thought[];
        await saveNewNote(noteToSave, thoughtsToSave);
      } else {
        const remainingIds = new Set(nextThoughts.map((thought) => thought.id));
        const thoughtsToDelete = [...originalThoughtIds].filter(
          (id) => !remainingIds.has(id)
        );
        await editNoteAction(noteToSave, nextThoughts, thoughtsToDelete);
      }
      setTitleRequiredError(false);
      onFolderErrorChange?.(false);
      thoughtsEditorRef.current?.clearValidationErrors();
      keepDraftOnExitRef.current = true;
      onEditingChange(false);
    } finally {
      onSavingChange?.(false);
    }
  }, [
    editNoteAction,
    feeling,
    folderId,
    getValues,
    isNew,
    locationId,
    locationName,
    note.createdAt,
    note.folderId,
    note.id,
    note.locationId,
    note.locationName,
    note.persons,
    note.feeling,
    note.rawText,
    note.summary,
    onEditingChange,
    onFolderErrorChange,
    onSavingChange,
    originalThoughtIds,
    persons,
    saveNewNote,
    setValue,
  ]);

  React.useEffect(() => {
    if (!saveActionRef) return;
    saveActionRef.current = () => {
      void saveNote();
    };
    return () => {
      saveActionRef.current = null;
    };
  }, [saveActionRef, saveNote]);

  const showTitles = note.thoughts.some((thought) =>
    Boolean(stripHtml(thought.title ?? ""))
  );

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
        className={
          isEditing
            ? "flex-col flex-1 min-h-0 w-full gap-4"
            : "flex-col flex-1 min-h-0 w-full gap-4 px-1"
        }
      >
        <View
          className={isEditing ? "w-full shrink-0 px-1" : "w-full shrink-0"}
        >
          {isEditing ? (
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  key={`note-title-${titleInputEpoch}`}
                  value={value}
                  onChangeText={(next) => {
                    titleDraftRef.current = next;
                    if (titleRequiredError) {
                      setTitleRequiredError(false);
                    }
                    onChange(next);
                  }}
                  placeholder={
                    titleRequiredError
                      ? noteDetailsTitleRequiredPlaceholder()
                      : NoteDetailsTitlePlaceholder()
                  }
                  placeholderTextColor={
                    titleRequiredError
                      ? requiredPlaceholderColor
                      : hsl("muted-foreground", colorScheme)
                  }
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

        <View
          className="flex-1 min-h-0"
          style={
            isEditing
              ? {
                  marginLeft: -(gutter("md").marginLeft ?? 8),
                  marginRight: -(gutter("md").marginRight ?? 8),
                }
              : undefined
          }
        >
          <ThoughtsEditor
            ref={thoughtsEditorRef}
            key={`${note.id}-${editorGeneration}`}
            noteId={note.id}
            categories={categoriesData ?? []}
            defaultShowTitles={showTitles}
            readOnly={!isEditing}
            showGraphButtons={!isEditing && !simplified}
            plain
            simplified={simplified}
            dockToolbarToKeyboard
            onToggleCompleted={({ id, isCompleted }) => {
              if (isEditing || isNew) return;
              persistThoughtCompletion({ id, isCompleted });
            }}
            onChangeCategory={({ id, categoryId }) => {
              if (isEditing || isNew) return;
              persistThoughtCategory({ id, categoryId });
            }}
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
  folderId = null,
  persons = [],
  feeling = null,
  locationId = null,
  locationName = null,
  isNew = false,
  onFolderErrorChange,
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
      folderId={folderId ?? noteRow.folderId ?? null}
      persons={persons}
      feeling={feeling}
      locationId={locationId}
      locationName={locationName}
      isNew={isNew}
      onFolderErrorChange={onFolderErrorChange}
    />
  );
};
