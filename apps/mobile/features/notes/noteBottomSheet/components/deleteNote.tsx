import { useDeleteNote } from "@/features/notes/deleteNote/hooks/useDeleteNote";
import { Button, Typography } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import { useModal } from "@/components/ui/modal/modal";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { Alert, View } from "react-native";
import {
  DeleteNoteActionLabel,
  noteDeleteFailedAlertTitle,
} from "../noteBottomSheetLabels";

type DeleteNoteProps = {
  noteId: string;
};

export const DeleteNote = ({ noteId }: DeleteNoteProps) => {
  const { dismiss } = useBottomSheetModal();
  const { deleteNoteAction } = useDeleteNote();
  const { openModal, closeModal } = useModal();

  const deleteNote = async () => {
    try {
      await deleteNoteAction(noteId);
      closeModal();
    } catch (error) {
      Alert.alert(noteDeleteFailedAlertTitle(), String(error));
    }
  };

  const openDeleteNoteConfirmationModal = () => {
    dismiss();
    openModal({
      modalName: "DELETE_NOTE_CONFIRMATION",
      onConfirm: deleteNote,
    });
  };

  return (
    <Button
      variant="destructive"
      size="default"
      onPress={openDeleteNoteConfirmationModal}
    >
      <View className="flex-row items-center gap-2">
        <Icon name="trash-2" color="destructive-foreground" size={18} />
        <Typography variant="h3">
          <DeleteNoteActionLabel />
        </Typography>
      </View>
    </Button>
  );
};
