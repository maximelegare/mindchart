import { PageContainer } from "@/components/layout/page/pageContainer";
import { useModal } from "@/components/ui/modal/modal";
import { useDeleteNote } from "@/features/notes/deleteNote/hooks/useDeleteNote";
import { useEditNote } from "@/features/notes/editNote/hooks/useEditNote";
import { EditNoteFeature } from "@/features/notes/editNote/views";
import { NoteDetailsFeature } from "@/features/notes/noteDetails/views";
import { SearchFeature } from "@/features/search/views";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

export const NoteDetailsPage = () => {
  const router = useRouter();
  const local = useLocalSearchParams();
  const [open, setOpen] = useState(false);

  const { editNoteAction } = useEditNote();
  const { deleteNoteAction } = useDeleteNote();
  const { openModal, closeModal } = useModal();

  const handleDeleteNote = async () => {
    openModal({
      modalName: "DELETE_NOTE_CONFIRMATION",
      onConfirm() {
        deleteNoteAction(local.id as string);
        closeModal();
        router.replace("/notes");
      },
    });
  };

  return (
    <PageContainer
      headerVariant="tab"
      title="Note"
      buttons={<SearchFeature />}
      moreOptionsMenu={{
        links: [
          {
            label: "Edit Note",
            icon: "pencil",
            component: (
              <EditNoteFeature
                noteId={local.id as string}
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
      <NoteDetailsFeature />
    </PageContainer>
  );
};
