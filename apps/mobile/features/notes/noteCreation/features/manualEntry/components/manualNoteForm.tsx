import { Category, Folder, Note, Thought } from "@repo/zod-schemas";

import React from "react";
import { Alert, Keyboard, ScrollView, TextInput, View } from "react-native";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Typography } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EditableField } from "@/components/ui/editableField";
import {
  ThoughtsEditor,
  createEmptyThought,
  type ThoughtsEditorHandle,
  type ThoughtsFormValue,
} from "@/components/ui/thoughtsEditor";
import {
  FolderSelector,
  type FolderSelection,
} from "@/features/notes/shared/ui/folderSelector";
import { Icon } from "@/components/ui/icons/icon";
import {
  KEYBOARD_ACTION_FOOTER_PADDING_Y,
  KeyboardActionFooter,
} from "@/features/notes/noteCreation/features/floatingButton/components/footer/keyboardActionFooter";

type ManualNoteFormData = {
  title: string;
  summary: string;
  folder: FolderSelection;
  thoughts: ThoughtsFormValue[];
};

type ManualNoteFormDefaultValues = {
  title?: string;
  summary?: string;
  folder?: Folder | null;
  thoughts?: Thought[];
};

type ManualNoteFormProps = {
  noteId: string;
  categories: Category[];
  onSubmit: (note: Note, thoughts: Thought[]) => void;
  defaultValues?: ManualNoteFormDefaultValues;
  defaultFolder?: FolderSelection;
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
  isCompletable: thought.isCompletable ?? false,
  isCompleted: thought.isCompleted ?? false,
});

const buildFormDefaultValues = (
  noteId: string,
  defaultFolder: FolderSelection,
  defaultValues?: ManualNoteFormDefaultValues
): ManualNoteFormData => {
  const folder =
    defaultValues?.folder !== undefined ? defaultValues.folder : defaultFolder;

  return {
    title: defaultValues?.title ?? "",
    summary: defaultValues?.summary ?? "",
    folder,
    thoughts: defaultValues?.thoughts?.length
      ? defaultValues.thoughts.map((thought) =>
          mapThoughtToFormValue(thought, noteId)
        )
      : [createEmptyThought(noteId)],
  };
};

const TITLE_SCROLL_PADDING = 12;
const FIELD_CHIP_HEIGHT = 40;
const FOOTER_BORDER_WIDTH = 1;
/** Extra gap between the editor card and the floating Save footer. */
const EDITOR_FOOTER_GAP = 12;
const FALLBACK_FOOTER_BUTTON_HEIGHT = 48;
const FALLBACK_FOOTER_CONTENT_HEIGHT =
  FALLBACK_FOOTER_BUTTON_HEIGHT + KEYBOARD_ACTION_FOOTER_PADDING_Y * 2;

export const ManualNoteForm = ({
  noteId,
  categories,
  onSubmit,
  defaultValues,
  defaultFolder = null,
}: ManualNoteFormProps) => {
  const insets = useSafeAreaInsets();
  const [titleContainerWidth, setTitleContainerWidth] = React.useState(0);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const [footerContentHeight, setFooterContentHeight] = React.useState(
    FALLBACK_FOOTER_CONTENT_HEIGHT
  );
  const titleInputRef = React.useRef<TextInput>(null);
  const thoughtsEditorRef = React.useRef<ThoughtsEditorHandle>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      titleInputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const editorBottomInset =
    footerContentHeight +
    FOOTER_BORDER_WIDTH +
    EDITOR_FOOTER_GAP +
    (keyboardHeight > 0 ? keyboardHeight : insets.bottom);

  const form = useForm<ManualNoteFormData>({
    defaultValues: buildFormDefaultValues(noteId, defaultFolder, defaultValues),
  });
  const { control, handleSubmit } = form;

  const handleSavePress = () => {
    Keyboard.dismiss();
    handleSubmit(handleFormSubmit)();
  };

  const handleFormSubmit = (data: ManualNoteFormData) => {
    const title = data.title.trim();
    const missing: string[] = [];
    if (!title) missing.push("a title");
    if (!data.folder) missing.push("a folder");
    if (missing.length > 0) {
      Alert.alert(
        "Can't save yet",
        `Please add ${missing.join(" and ")} before saving.`
      );
      return;
    }

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

    if (thoughts.length === 0) {
      Alert.alert("Can't save yet", "Add at least one thought before saving.");
      return;
    }

    const note: Note = {
      id: noteId,
      title,
      summary: data.summary.trim(),
      rawText: "",
      folderId: data.folder!.id,
      createdAt: new Date().toISOString(),
      showTitles: thoughtsEditorRef.current?.titlesEnabled() ?? false,
    };

    onSubmit(note, thoughts);
  };

  return (
    <FormProvider {...form}>
      <View className="relative min-h-0 w-full flex-1 flex-col">
        <View className="min-h-0 w-full flex-1 flex-col gap-2 px-4">
          <View className="flex-row gap-4 items-start w-full shrink-0">
            <View className="flex-1 min-w-0 flex-col">
              <Label className="mb-0 text-popover-foreground" nativeID="title">
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
                        ref={titleInputRef}
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
              <Label className="mb-0 text-popover-foreground" nativeID="folder">
                Folder
              </Label>
              <Controller
                control={control}
                name="folder"
                render={({ field: { onChange, value } }) => (
                  <FolderSelector
                    selectedFolder={value}
                    onSelect={onChange}
                    maxChars={18}
                    allowRoot={false}
                  />
                )}
              />
            </View>
          </View>

          <View
            className="mt-5 min-h-0 flex-1"
            style={{ paddingBottom: editorBottomInset }}
          >
            <ThoughtsEditor
              ref={thoughtsEditorRef}
              noteId={noteId}
              categories={categories}
              defaultShowTitles={
                defaultValues?.thoughts?.some((thought) =>
                  thought.title?.trim()
                ) ?? false
              }
            />
          </View>
        </View>

        <KeyboardActionFooter onContentHeightChange={setFooterContentHeight}>
          <Button
            onPress={handleSavePress}
            variant="secondary"
            size="default"
            cornerRadius="full"
            className="flex-row items-center gap-2 px-6"
          >
            <Icon name="save" color="card" />
            <Typography variant="h4">Save Note</Typography>
          </Button>
        </KeyboardActionFooter>
      </View>
    </FormProvider>
  );
};
