import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import type { IconName } from "@/components/ui/icons/icon-registry";
import { useModal } from "@/components/ui/modal/modal";
import { useWorkSpaces } from "@/features/workspaces/hooks/useWorkSpaces";
import { WorkspaceActionsModal } from "@/features/workspaces/components/workspaceActionsModal";
import { WorkspaceEdit } from "@/features/workspaces/components/workspaceEdit";
import type { Workspace } from "@/features/workspaces/context/workspacesContext";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Gutter } from "@/components/ui/gutter";
import { WorkspaceAvatar } from "@/features/workspaces/components/workspaceAvatar";
import { Icon } from "@/components/ui/icons/icon";
import { hasKeyForWorkspace } from "@/features/settings/features/recoveryKeys/workspaceKeyService";
import { WorkspaceKeyMissingError } from "@/features/settings/features/recoveryKeys/workspaceKeyErrors";

export const NewWorkspaceLayout = () => {
  const {
    workspaces,
    activeWorkspaceId,
    activeWorkspace,
    switchWorkspace,
    renameWorkspace,
    exportWorkspace,
    deleteWorkspace,
  } = useWorkSpaces();
  const { openModal, closeModal, setModalContent } = useModal();

  const [hasKeyByWorkspaceId, setHasKeyByWorkspaceId] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        workspaces.map(
          async (w) =>
            [w.id, await hasKeyForWorkspace(w.id)] as [string, boolean]
        )
      );
      if (!cancelled) {
        setHasKeyByWorkspaceId(Object.fromEntries(entries));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workspaces]);

  const handleSwitch = async (workspace: Workspace) => {
    try {
      await switchWorkspace(workspace.id);
    } catch (error) {
      if (error instanceof WorkspaceKeyMissingError) {
        Alert.alert(
          "Workspace unavailable",
          "This workspace has no encryption key on this device."
        );
        return;
      }
      throw error;
    }
  };

  const openRenameModal = (workspace: Workspace) => {
    setModalContent({
      modalName: "RENAME_WORKSPACE",
      customContent: () => (
        <WorkspaceEdit
          initialName={workspace.name}
          initialColor={workspace.color}
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
      title: "More actions",
      customContent: () => (
        <WorkspaceActionsModal
          workspace={workspace}
          isActive={isActive}
          canDelete={canDelete}
          onSwitch={async () => {
            closeModal();
            await handleSwitch(workspace);
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

  return (
    <Card>
      <Gutter size="md" className="py-4">
        <View className="flex-col pb-4">
          <Typography variant="h3" padding>
            Manage Workspaces
          </Typography>
          <Typography variant="p" padding>
            Manage your workspaces here. Each workspace has its seperate
            database.
          </Typography>
        </View>

        {/* Engine Status Card */}
        <View className="pb-6">
          <Typography className="text-muted-foreground" variant="h4" padding>
            Active Workspace
          </Typography>
          <Card
            className={cn(
              "p-2 flex-row items-center bg-muted-foreground",
              !!activeWorkspaceId && "border-primary"
            )}
          >
            <View className="flex-row items-center gap-2">
              <WorkspaceAvatar />
              <Typography variant="h3">
                {activeWorkspace?.name ?? "None"}
              </Typography>
            </View>
          </Card>
        </View>

        {/* Model List Section */}
        <View>
          <Typography variant="h4" className="text-muted-foreground" padding>
            Available Workspaces
          </Typography>
          <View className="flex-col gap-4">
            {workspaces.map((workspace) => {
              const isActive = workspace.id === activeWorkspace?.id;
              const hasKey = hasKeyByWorkspaceId[workspace.id] ?? false;
              return (
                <Card
                  key={workspace.id}
                  className={cn(
                    "p-2 flex-row items-center bg-muted",
                    isActive && "border-primary"
                  )}
                >
                  <View className="flex-1 flex-row items-center gap-2">
                    <WorkspaceAvatar workspace={workspace} />
                    <View>
                      <Typography variant="h3" className="text-base">
                        {workspace.name}
                      </Typography>
                      <Typography
                        variant="small"
                        className="text-muted-foreground"
                      >
                        {isActive ? "Active" : hasKey ? "Load" : "Key missing"}
                      </Typography>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <Button
                      onPress={() => handleSwitch(workspace)}
                      disabled={isActive || !hasKey}
                      size="sm"
                      variant="default"
                      className="flex-row items-center gap-2"
                    >
                      <Typography>
                        {isActive
                          ? "Active"
                          : hasKey
                            ? "Switch"
                            : "Unavailable"}
                      </Typography>
                      {!isActive && (
                        <Icon
                          name="arrow-right-left"
                          color="background"
                          size={16}
                        />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onPress={() => openActionsModal(workspace)}
                    >
                      <Icon
                        name="ellipsis-vertical"
                        color="foreground"
                        size={18}
                      />
                    </Button>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>
      </Gutter>
    </Card>
  );
};
