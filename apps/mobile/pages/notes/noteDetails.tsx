import { PageContainer } from "@/components/layout/page/pageContainer";
import { useModal } from "@/components/ui/modal/modal";
import { useDeleteNote } from "@/features/notes/deleteNote/hooks/useDeleteNote";
import { EditNoteButton } from "@/features/notes/editNote/components/editNoteButton";
import { NoteDetailsOptionsHeader } from "@/features/notes/noteDetails/components/noteDetailsOptionsHeader";
import { useNoteDetailsData } from "@/features/notes/noteDetails/hooks/useNoteDetailsData";
import { NoteDetailsFeature } from "@/features/notes/noteDetails/views";
import { Topic } from "@repo/zod-schemas";
import { router } from "expo-router";
import { useRef, useState } from "react";

export const NoteDetailsPage = () => {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [simplified, setSimplified] = useState(false);
  const [headerTopic, setHeaderTopic] = useState<Topic | null>(null);
  const saveActionRef = useRef<(() => void) | null>(null);
  const topicActionRef = useRef<((topic: Topic) => void) | null>(null);
  const { deleteNoteAction } = useDeleteNote();
  const { openModal, closeModal } = useModal();
  const { noteTitle, isPending, note, noteId } = useNoteDetailsData();

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
      subtitle={{ text: "Note", icon: "notebook-text" }}
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
        onEditingChange={setIsEditing}
        saveActionRef={saveActionRef}
        onSavingChange={setIsSaving}
        simplified={simplified}
        topicActionRef={topicActionRef}
        onTopicChange={setHeaderTopic}
      />
    </PageContainer>
  );
};
