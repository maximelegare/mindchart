import { PageContainer } from "@/components/layout/page/pageContainer";
import { useModal } from "@/components/ui/modal/modal";
import { useDeleteNote } from "@/features/notes/deleteNote/hooks/useDeleteNote";
import { EditNoteButton } from "@/features/notes/editNote/components/editNoteButton";
import { NoteDetailsOptionsHeader } from "@/features/notes/noteDetails/components/noteDetailsOptionsHeader";
import { useNoteDetailsData } from "@/features/notes/noteDetails/hooks/useNoteDetailsData";
import { NoteDetailsFeature } from "@/features/notes/noteDetails/views";
import type { NoteEditorMode } from "@/features/notes/noteDetails/types";
import { Topic } from "@repo/zod-schemas";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";

function parseEditorMode(value: string | string[] | undefined): NoteEditorMode {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "preview" ? "preview" : "regular";
}

export const NoteDetailsPage = () => {
  const { mode: modeParam } = useLocalSearchParams<{
    id: string;
    mode?: string;
  }>();
  const [open, setOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<NoteEditorMode>(() =>
    parseEditorMode(modeParam)
  );
  const [isEditing, setIsEditing] = useState(
    () => parseEditorMode(modeParam) === "preview"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [simplified, setSimplified] = useState(false);
  const [headerTopic, setHeaderTopic] = useState<Topic | null>(null);
  const saveActionRef = useRef<(() => void) | null>(null);
  const topicActionRef = useRef<((topic: Topic) => void) | null>(null);
  const { deleteNoteAction } = useDeleteNote();
  const { openModal, closeModal } = useModal();
  const { noteTitle, isPending, note, noteId } = useNoteDetailsData();

  useEffect(() => {
    const nextMode = parseEditorMode(modeParam);
    setEditorMode(nextMode);
    if (nextMode === "preview") {
      setIsEditing(true);
    }
  }, [modeParam, noteId]);

  const handleDeleteNote = () => {
    openModal({
      modalName: "DELETE_NOTE_CONFIRMATION",
      onConfirm: async () => {
        closeModal();
        await deleteNoteAction(noteId ?? "");
        router.replace("/notes");
      },
    });
  };

  const switchToRegularMode = () => {
    if (editorMode === "regular") return;
    setEditorMode("regular");
    router.setParams({ mode: "regular" });
  };

  const handleEditingChange = (editing: boolean) => {
    setIsEditing(editing);
    // Leaving edit after a preview save promotes the note to regular mode.
    if (!editing && editorMode === "preview") {
      switchToRegularMode();
    }
  };

  const handleEditPress = () => {
    if (isEditing) {
      saveActionRef.current?.();
      return;
    }
    setIsEditing(true);
  };

  const handleTopicSelect = (topic: Topic) => {
    setHeaderTopic(topic);
    topicActionRef.current?.(topic);
  };

  return (
    <PageContainer
      headerVariant="tab"
      title={noteTitle ?? ""}
      subtitle={{
        text: editorMode === "preview" ? "Review note" : "Note",
        icon: "notebook-text",
      }}
      hideTabBar
      noScrollView
      optionsHeader={
        <NoteDetailsOptionsHeader
          topic={headerTopic}
          onTopicSelect={handleTopicSelect}
          simplified={simplified}
          onSimplifiedChange={setSimplified}
        />
      }
      buttons={
        noteId
          ? [
              <EditNoteButton
                key="edit-note"
                isEditing={isEditing}
                onPress={handleEditPress}
                disabled={isSaving}
              />,
            ]
          : []
      }
      moreOptionsMenu={{
        links: [
          {
            label: "Delete Note",
            icon: "trash-2",
            action: handleDeleteNote,
          },
          { label: "Settings", icon: "settings", href: "/settings" },
        ],
        state: { open, setOpen },
        trigger: "ellipsis",
        currentWorkspace: false,
      }}
    >
      <NoteDetailsFeature
        isPending={isPending}
        note={note}
        isEditing={isEditing}
        onEditingChange={handleEditingChange}
        saveActionRef={saveActionRef}
        onSavingChange={setIsSaving}
        simplified={simplified}
        topicActionRef={topicActionRef}
        onTopicChange={setHeaderTopic}
        editorMode={editorMode}
      />
    </PageContainer>
  );
};
