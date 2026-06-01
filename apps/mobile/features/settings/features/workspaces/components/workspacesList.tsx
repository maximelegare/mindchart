import { View } from "react-native";
import List from "@/components/ui/list";
import ListItem from "@/components/ui/list-item";
import { Icon } from "@/components/ui/icons/icon";
import type { IconName } from "@/components/ui/icons/icon-registry";
import { useModal } from "@/components/ui/modal/modal";
import { useWorkSpaces } from "../../../../workspaces/hooks/useWorkSpaces";
import { WorkspaceActionsModal } from "../../../../workspaces/components/workspaceActionsModal";
import { WorkspaceAvatar } from "../../../../workspaces/components/workspaceAvatar";
import { WorkspaceNameInputModal } from "../../../../workspaces/components/workspaceNameInputModal";
import type { Workspace } from "../../../../workspaces/context/workspacesContext";
import { cn } from "@/lib/cn";
import { parseWorkspaceColor } from "../../../../workspaces/utils/workspaceColor";

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
          initialColor={parseWorkspaceColor(workspace.color)}
          initialIcon={workspace.icon as IconName | undefined}
          confirmLabel="Save"
          description="Choose a new name, color, and icon for this workspace."
          onCancel={closeModal}
          onConfirm={async ({ name, color, icon }) => {
            await renameWorkspace(workspace.id, name, { color, icon });
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
      title: workspace.name,
      description: "Choose an action to perform on this workspace.",
      // customContent: () => (
      //   <WorkspaceActionsModal
      //     workspace={workspace}
      //     isActive={isActive}
      //     canDelete={canDelete}
      //     onSwitch={async () => {
      //       closeModal();
      //       await switchWorkspace(workspace.id);
      //     }}
      //     onRename={() => openRenameModal(workspace)}
      //     onExport={async () => {
      //       closeModal();
      //       await exportWorkspace(workspace.id);
      //     }}
      //     onDelete={() => openDeleteModal(workspace)}
      //     onCancel={closeModal}
      //   />
      // ),
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
            className={"bg-background"}
            label={workspace.name}
            description={isActive ? "Active" : undefined}
            itemLeft={() => (
              <View
                className={cn(
                  isActive && "rounded-full border-2 border-popover-foreground"
                )}
              >
                <WorkspaceAvatar workspace={workspace} />
              </View>
            )}
            itemRight={() => (
              <Icon name="ellipsis-vertical" color="foreground" size={18} />
            )}
            noChevron
            onPress={() => openActionsModal(workspace)}
          />
        );
      })}
    </List>
  );
};
