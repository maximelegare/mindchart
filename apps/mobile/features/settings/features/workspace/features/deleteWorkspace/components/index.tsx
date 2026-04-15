import { Icon } from "@/components/ui/icons/icon";
import ListItem from "@/components/ui/list-item";
import { useModal } from "@/components/ui/modal/modal";
import { closeOPDatabase, removeDatabaseFile } from "@repo/sqlite";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

export const DeleteWorkspaceFeature = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { openModal, closeModal } = useModal();

  const dropDatabaseFile = () => {
    openModal({
      modalName: "DELETE_DATABASE_FILE",

      onConfirm: async () => {
        await closeOPDatabase();
        await removeDatabaseFile();
        queryClient.clear();
        closeModal();
        router.replace("/newDatabase");
      },
    });
  };

  return (
    <ListItem
      className="bg-background"
      itemLeft={() => <Icon name="trash-2" color="foreground" />}
      label="Delete Workspace"
      onPress={dropDatabaseFile}
    />
  );
};
