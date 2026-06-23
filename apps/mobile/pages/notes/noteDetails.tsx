import { PageContainer } from "@/components/layout/page/pageContainer";
import { useModal } from "@/components/ui/modal/modal";
import { useDeleteNote } from "@/features/notes/deleteNote/hooks/useDeleteNote";
import { useEditNote } from "@/features/notes/editNote/hooks/useEditNote";
import { EditNoteFeature } from "@/features/notes/editNote/views";
import { useNoteDetailsData } from "@/features/notes/noteDetails/hooks/useNoteDetailsData";
import { NoteDetailsFeature } from "@/features/notes/noteDetails/views";
import { SearchFeature } from "@/features/search/views";
import { useRouter } from "expo-router";
import { useState } from "react";

export const NoteDetailsPage = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { noteId, noteTitle, isPending, note } = useNoteDetailsData();

  const { editNoteAction } = useEditNote();
  const { deleteNoteAction } = useDeleteNote();
  const { openModal, closeModal } = useModal();

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
      buttons={<SearchFeature />}
      moreOptionsMenu={{
        links: [
          {
            label: "Edit Note",
            icon: "pencil",
            component: (
              <EditNoteFeature
                noteId={noteId ?? ""}
                setOpen={setOpen}
                onAction={editNoteAction}
              />
            ),
          },
          { label: "Delete Note", icon: "trash-2", action: handleDeleteNote },
          { label: "Settings", icon: "settings", href: "/settings" },
        ],
        state: { open, setOpen },
      }}
    >
      <NoteDetailsFeature isPending={isPending} note={note} />
    </PageContainer>
  );
};
