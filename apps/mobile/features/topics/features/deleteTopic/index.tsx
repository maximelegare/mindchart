import { useControllers } from "@/api/controllers/useControllers";
import { Button, Typography } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import { useModal } from "@/components/ui/modal/modal";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { Alert, View } from "react-native";

export const DeleteTopic = ({ topicId }: { topicId: string }) => {
  const { dismiss } = useBottomSheetModal();
  const { useDeleteTopicByIdMutation } = useControllers().topics;
  const { mutateAsync: deleteTopicByIdMutateAsync, isPending } =
    useDeleteTopicByIdMutation();

  const { openModal, closeModal } = useModal();

  const openDeleteTopicConfirmationModal = () => {
    dismiss();
    openModal({
      modalName: "DELETE_TOPIC_CONFIRMATION",
      onConfirm: deleteTopicAction,
      onCancel: dismiss,
    });
  };

  const deleteTopicAction = async () => {
    try {
      await deleteTopicByIdMutateAsync({ id: topicId });
      closeModal();
    } catch (error) {
      Alert.alert("Delete failed", String(error));
    }
  };

  return (
    <Button
      variant="destructive"
      size="default"
      disabled={isPending}
      onPress={openDeleteTopicConfirmationModal}
    >
      <View className="flex-row items-center gap-2">
        <Icon name="trash-2" color="destructive-foreground" size={18} />
        <Typography variant="h3">Delete topic</Typography>
      </View>
    </Button>
  );
};
