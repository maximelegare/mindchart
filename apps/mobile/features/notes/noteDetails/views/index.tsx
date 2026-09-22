import React from "react";
import { Keyboard, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
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
import {
  assembleThought,
  getThoughtPlainText,
  type FeelingValue,
  Person,
} from "@repo/zod-schemas";
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
  thought: Parameters<typeof assembleThought>[0] | ThoughtsFormValue,
  noteId: string
): ThoughtsFormValue =>
  assembleThought({
    ...thought,
    noteId: thought.noteId ?? noteId,
  });

type TransitionEndEvent = { data?: { closing?: boolean } };

/** Native stack emits this at runtime; generic NavigationProp types omit it. */
type NavigationWithTransitionEnd = {
  addListener: (
    event: "transitionEnd",
    callback: (event: TransitionEndEvent) => void
  ) => () => void;
  getParent: () => NavigationWithTransitionEnd | undefined;
};

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
      const showTitles =
        thoughtsEditorRef.current?.titlesEnabled() ?? note.showTitles ?? false;
      const nextThoughts = data.thoughts
        .filter(
          (thought) =>
            stripHtml(thought.title) ||
            stripHtml(getThoughtPlainText(thought)) ||
            thought.semanticLabel.trim()
        )
        .map((thought) => {
          const thoughtTitle = stripHtml(thought.title);
          const text = stripHtml(getThoughtPlainText(thought)) || thoughtTitle;
          const semanticLabel =
            stripHtml(thought.semanticLabel) || thoughtTitle || text;
          const withText =
            thought.type === "checkbox"
              ? {
                  ...thought,
                  content: { text, checked: thought.content.checked },
                }
              : { ...thought, content: { text } };
          return {
            ...withText,
            title: thought.title.trim(),
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
        showTitles,
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
    note.showTitles,
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

  const showTitles = note.showTitles ?? false;

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
        className="flex-col flex-1 min-h-0 w-full gap-4"
      >
        <View className="w-full shrink-0 px-1">
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
          style={{
            marginLeft: -(gutter("md").marginLeft ?? 8),
            marginRight: -(gutter("md").marginRight ?? 8),
          }}
        >
          <ThoughtsEditor
            ref={thoughtsEditorRef}
            key={`${note.id}-${editorGeneration}`}
            noteId={note.id}
            categories={categoriesData ?? []}
            defaultShowTitles={showTitles}
            readOnly={!isEditing}
            plain
            simplified={simplified}
            dockToolbarToKeyboard
            onRequestEdit={() => onEditingChange(true)}
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
  const navigation = useNavigation();
  const [surfaceReady, setSurfaceReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const nav = navigation as NavigationWithTransitionEnd;

    const markReady = () => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) setSurfaceReady(true);
        });
      });
    };

    const onEnd = (event: TransitionEndEvent) => {
      if (event.data?.closing) return;
      markReady();
    };

    const unsub = nav.addListener("transitionEnd", onEnd);
    const unsubParent = nav.getParent()?.addListener("transitionEnd", onEnd);
    // FAB / already-focused pushes may never emit transitionEnd.
    const fallback = setTimeout(markReady, 400);

    return () => {
      cancelled = true;
      clearTimeout(fallback);
      unsub();
      unsubParent?.();
    };
  }, [navigation]);

  const noteRow = note?.[0];
  const willMountEditor = surfaceReady && !isPending && Boolean(noteRow);

  if (!willMountEditor || !noteRow) {
    return <View className="flex-1" collapsable={false} />;
  }

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
