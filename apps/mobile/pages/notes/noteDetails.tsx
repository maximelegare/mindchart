import { PageContainer } from "@/components/layout/page/pageContainer";
import { useModal } from "@/components/ui/modal/modal";
import { useDeleteNote } from "@/features/notes/deleteNote/hooks/useDeleteNote";
import { EditNoteButton } from "@/features/notes/editNote/components/editNoteButton";
import { useNoteDetailsData } from "@/features/notes/noteDetails/hooks/useNoteDetailsData";
import { NoteDetailsFeature } from "@/features/notes/noteDetails/views";
import { router } from "expo-router";
import { useState } from "react";

export const NoteDetailsPage = () => {
  const [open, setOpen] = useState(false);
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

  return (
    <PageContainer
      headerVariant="tab"
      title={noteTitle ?? ""}
      subtitle={{ text: "Note", icon: "notebook-text" }}
      buttons={noteId ? [<EditNoteButton noteId={noteId} />] : []}
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
      <NoteDetailsFeature isPending={isPending} note={note} />
    </PageContainer>
  );
};
