import ListItem from "@/components/ui/list-item";
import { Icon } from "@/components/ui/icons/icon";
import { useModal } from "@/components/ui/modal/modal";
import { useWorkSpaces } from "../../../../workspaces/hooks/useWorkSpaces";
import { WorkspaceNameInputModal } from "../../../../workspaces/components/workspaceNameInputModal";

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
        <WorkspaceNameInputModal
          confirmLabel="Create"
          description="Each workspace has its own isolated database."
          onCancel={closeModal}
          onConfirm={async (name) => {
            closeModal();
            await createWorkspace(name);
            onCreated?.();
          }}
        />
      ),
    });
  };

  return (
    <ListItem
      className="bg-background"
      itemLeft={() => <Icon name="plus" color="foreground" />}
      label="New Workspace"
      onPress={open}
      noChevron
    />
  );
};
