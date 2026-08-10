import { Icon } from "@/components/ui/icons/icon";
import { useModal } from "@/components/ui/modal/modal";
import { useWorkSpaces } from "@/features/workspaces/hooks/useWorkSpaces";
import { WorkspaceEdit } from "@/features/workspaces/components/manageWorkspaces/workspaceEdit";
import { Button, Typography } from "@/components/ui";
import { View } from "react-native";

type Props = {
  onCreated?: () => void;
};

export const CreateWorkspaceRow = ({ onCreated }: Props) => {
  const { createWorkspace } = useWorkSpaces();
  const { openModal, closeModal } = useModal();

  const open = () => {
    openModal({
      modalName: "CREATE_WORKSPACE",
      customContent: () => (
        <WorkspaceEdit
          confirmLabel="Create"
          description="Each workspace has its own isolated database."
          onCancel={closeModal}
          onConfirm={async ({ name, color, icon }) => {
            closeModal();
            await createWorkspace(name, { color, icon });
            onCreated?.();
          }}
        />
      ),
    });
  };

  return (
    <Button variant="default" className="w-full" onPress={open}>
      <View className="flex-row items-center gap-2">
        <Icon name="plus" color="background" />
        <Typography>New</Typography>
      </View>
    </Button>
  );
};
