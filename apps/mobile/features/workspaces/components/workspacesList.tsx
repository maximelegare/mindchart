import List from "@/components/ui/list";
import ListItem from "@/components/ui/list-item";
import { Icon } from "@/components/ui/icons/icon";
import { useModal } from "@/components/ui/modal/modal";
import { useWorkSpaces } from "../hooks/useWorkSpaces";
import { WorkspaceActionsModal } from "./workspaceActionsModal";
import { WorkspaceNameInputModal } from "./workspaceNameInputModal";
import type { Workspace } from "../context/workspacesContext";

export const WorkspacesList = () => {
  const {
    workspaces,
    activeWorkspaceId,
    switchWorkspace,
    renameWorkspace,
    exportWorkspace,
    deleteWorkspace,
  } = useWorkSpaces();
  const { openModal, closeModal, setModalContent } = useModal();

  const openRenameModal = (workspace: Workspace) => {
    setModalContent({
      modalName: "RENAME_WORKSPACE",
      customContent: () => (
        <WorkspaceNameInputModal
          initialName={workspace.name}
          confirmLabel="Save"
          description="Choose a new name for this workspace."
          onCancel={closeModal}
          onConfirm={async (name) => {
            await renameWorkspace(workspace.id, name);
            closeModal();
          }}
        />
      ),
    });
  };

  const openDeleteModal = (workspace: Workspace) => {
    setModalContent({
      modalName: "DELETE_WORKSPACE",
      customContent: undefined,
      onConfirm: async () => {
        await deleteWorkspace(workspace.id);
        closeModal();
      },
      onCancel: closeModal,
    });
  };

  const openActionsModal = (workspace: Workspace) => {
    const isActive = workspace.id === activeWorkspaceId;
    const canDelete = workspaces.length > 1 || !isActive;
    openModal({
      customContent: () => (
        <WorkspaceActionsModal
          workspace={workspace}
          isActive={isActive}
          canDelete={canDelete}
          onSwitch={async () => {
            closeModal();
            await switchWorkspace(workspace.id);
          }}
          onRename={() => openRenameModal(workspace)}
          onExport={async () => {
            closeModal();
            await exportWorkspace(workspace.id);
          }}
          onDelete={() => openDeleteModal(workspace)}
          onCancel={closeModal}
        />
      ),
    });
  };

  if (workspaces.length === 0) return null;

  return (
    <List>
      {workspaces.map((workspace) => {
        const isActive = workspace.id === activeWorkspaceId;
        return (
          <ListItem
            key={workspace.id}
            className="bg-background"
            label={workspace.name}
            description={isActive ? "Active" : undefined}
            itemLeft={() => (
              <Icon
                name={isActive ? "check" : "database"}
                color={isActive ? "primary" : "foreground"}
              />
            )}
            itemRight={() => (
              <Icon name="ellipsis-vertical" color="foreground" size={20} />
            )}
            noChevron
            onPress={() => openActionsModal(workspace)}
          />
        );
      })}
    </List>
  );
};
